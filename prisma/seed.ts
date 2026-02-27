import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin1234', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      passwordHash
    }
  });

  const pipelineOne = await prisma.pipeline.create({
    data: {
      name: 'AWS Infrastructure Plan',
      repoUrl: 'https://github.com/example/terraform-aws',
      repoBranch: 'main',
      path: 'infra/aws',
      terraformVersion: '1.6.6',
      variables: JSON.stringify({ region: 'us-east-1', env: 'staging' }),
      status: 'active'
    }
  });

  const pipelineTwo = await prisma.pipeline.create({
    data: {
      name: 'GCP Network Validate',
      repoUrl: 'https://github.com/example/terraform-gcp',
      repoBranch: 'develop',
      path: 'network',
      terraformVersion: '1.5.7',
      variables: JSON.stringify({ project: 'core-platform', env: 'dev' }),
      status: 'active'
    }
  });

  const runOne = await prisma.run.create({
    data: {
      pipelineId: pipelineOne.id,
      type: 'plan',
      status: 'succeeded',
      initiatedBy: admin.id,
      startTime: new Date(Date.now() - 1000 * 60 * 10),
      endTime: new Date(Date.now() - 1000 * 60 * 6),
      exitCode: 0,
      logsUrl: '/logs/run-1.log',
      planOutput: 'Plan: 2 to add, 0 to change, 0 to destroy.',
      applyOutput: ''
    }
  });

  const runTwo = await prisma.run.create({
    data: {
      pipelineId: pipelineTwo.id,
      type: 'validate',
      status: 'failed',
      initiatedBy: 'system',
      startTime: new Date(Date.now() - 1000 * 60 * 30),
      endTime: new Date(Date.now() - 1000 * 60 * 25),
      exitCode: 1,
      logsUrl: '/logs/run-2.log',
      planOutput: 'Error: Invalid provider configuration.',
      applyOutput: ''
    }
  });

  await prisma.artifact.create({
    data: {
      runId: runOne.id,
      type: 'plan',
      location: 's3://terraform-artifacts/plan-001.tfplan'
    }
  });

  await prisma.artifact.create({
    data: {
      runId: runTwo.id,
      type: 'log',
      location: 's3://terraform-artifacts/logs/run-002.log'
    }
  });

  await prisma.auditLog.create({
    data: {
      action: 'pipeline.create',
      entity: 'Pipeline',
      entityId: pipelineOne.id,
      userId: admin.id,
      metadata: JSON.stringify({ name: pipelineOne.name })
    }
  });

  await prisma.auditLog.create({
    data: {
      action: 'run.trigger',
      entity: 'Run',
      entityId: runOne.id,
      userId: admin.id,
      metadata: JSON.stringify({ pipelineId: pipelineOne.id, type: 'plan' })
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
