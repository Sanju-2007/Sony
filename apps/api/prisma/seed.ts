import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Core Users
  const sanju = await prisma.user.upsert({
    where: { username: 'sanju' },
    update: {},
    create: {
      username: 'sanju',
      email: 'sanju@example.com',
      passwordHash,
      profile: {
        create: {
          displayName: 'Sanju',
          bio: 'Listening to synthwave & ambient beats',
          favoriteGenres: ['Ambient', 'Synthwave', 'Electronic'],
        },
      },
    },
    include: { profile: true },
  });

  const aisha = await prisma.user.upsert({
    where: { username: 'aisha' },
    update: {},
    create: {
      username: 'aisha',
      email: 'aisha@example.com',
      passwordHash,
      profile: {
        create: {
          displayName: 'Aisha',
          bio: 'Lo-Fi lover & late night coder',
          favoriteGenres: ['Lo-Fi', 'Chillhop'],
        },
      },
    },
  });

  const rahul = await prisma.user.upsert({
    where: { username: 'rahul' },
    update: {},
    create: {
      username: 'rahul',
      email: 'rahul@example.com',
      passwordHash,
      profile: {
        create: {
          displayName: 'Rahul',
          bio: 'Basslines & soulful grooves',
          favoriteGenres: ['R&B', 'Soul', 'Synthwave'],
        },
      },
    },
  });

  const priya = await prisma.user.upsert({
    where: { username: 'priya' },
    update: {},
    create: {
      username: 'priya',
      email: 'priya@example.com',
      passwordHash,
      profile: {
        create: {
          displayName: 'Priya',
          bio: 'Acoustic sessions and quiet mornings',
          favoriteGenres: ['Acoustic', 'Folk'],
        },
      },
    },
  });

  // 2. Create Friendships
  await prisma.friendship.upsert({
    where: { requesterId_addresseeId: { requesterId: sanju.id, addresseeId: aisha.id } },
    update: {},
    create: { requesterId: sanju.id, addresseeId: aisha.id, status: 'ACCEPTED' },
  });

  await prisma.friendship.upsert({
    where: { requesterId_addresseeId: { requesterId: sanju.id, addresseeId: rahul.id } },
    update: {},
    create: { requesterId: sanju.id, addresseeId: rahul.id, status: 'ACCEPTED' },
  });

  await prisma.friendship.upsert({
    where: { requesterId_addresseeId: { requesterId: sanju.id, addresseeId: priya.id } },
    update: {},
    create: { requesterId: sanju.id, addresseeId: priya.id, status: 'ACCEPTED' },
  });

  // 3. Create Demo Rooms
  const roomLateNight = await prisma.room.upsert({
    where: { slug: 'late-night-family' },
    update: {},
    create: {
      name: 'Late Night Family',
      slug: 'late-night-family',
      description: 'Synthwave & Deep Ambient listening sessions',
      type: 'PUBLIC',
      ownerId: sanju.id,
      maxParticipants: 50,
      playbackState: {
        create: {
          provider: 'LICENSED_CATALOG',
          trackId: 'track-ambient-01',
          trackTitle: 'Midnight Ambient Waves',
          artistName: 'Sony Sound Collective',
          albumName: 'Presence Vol. 1',
          artworkUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&fit=crop&q=80',
          durationMs: 240000,
          positionMs: 64000,
          playbackRate: 1.0,
          isPlaying: true,
          serverTimestamp: BigInt(Date.now() - 64000),
          version: 12,
          updatedByUserId: sanju.id,
        },
      },
    },
  });

  // Add members to Late Night Family
  await prisma.roomMember.upsert({
    where: { roomId_userId: { roomId: roomLateNight.id, userId: sanju.id } },
    update: {},
    create: { roomId: roomLateNight.id, userId: sanju.id, role: 'HOST' },
  });

  await prisma.roomMember.upsert({
    where: { roomId_userId: { roomId: roomLateNight.id, userId: rahul.id } },
    update: {},
    create: { roomId: roomLateNight.id, userId: rahul.id, role: 'LISTENER' },
  });

  await prisma.roomMember.upsert({
    where: { roomId_userId: { roomId: roomLateNight.id, userId: aisha.id } },
    update: {},
    create: { roomId: roomLateNight.id, userId: aisha.id, role: 'LISTENER' },
  });

  await prisma.roomMember.upsert({
    where: { roomId_userId: { roomId: roomLateNight.id, userId: priya.id } },
    update: {},
    create: { roomId: roomLateNight.id, userId: priya.id, role: 'LISTENER' },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
