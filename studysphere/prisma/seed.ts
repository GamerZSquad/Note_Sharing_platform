import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

function pdf(title: string, lines: string[]): Buffer {
  const escapedTitle = title.replace(/[()\\]/g, " ");
  const body = lines
    .map((line, index) => `0 -22 Td (${line.replace(/[()\\]/g, " ")}) Tj`)
    .join(" ");
  const stream = `BT /F1 20 Tf 50 740 Td (${escapedTitle}) Tj /F1 12 Tf 0 -32 Td ${body} ET`;
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj",
    `4 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
  ];
  const content = `%PDF-1.4\n${objects.join("\n")}\ntrailer << /Root 1 0 R >>\n%%EOF`;
  return Buffer.from(content);
}

async function main() {
  await prisma.rating.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.report.deleteMany();
  await prisma.noteTag.deleteMany();
  await prisma.note.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.searchEvent.deleteMany();
  await prisma.trustedDomain.deleteMany();
  await prisma.externalResource.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      name: "Asha Rao",
      email: "admin@studysphere.dev",
      passwordHash: await hash("Admin123", 12),
      role: "ADMIN",
      status: "ACTIVE",
      department: "Computer Science",
      emailVerified: new Date(),
    },
  });

  const student = await prisma.user.create({
    data: {
      name: "Rahul Mehta",
      email: "student@studysphere.dev",
      passwordHash: await hash("Student123", 12),
      role: "STUDENT",
      status: "ACTIVE",
      department: "Computer Science",
      semester: 6,
      emailVerified: new Date(),
    },
  });

  const peer = await prisma.user.create({
    data: {
      name: "Neha Iyer",
      email: "neha@studysphere.dev",
      passwordHash: await hash("Student123", 12),
      role: "STUDENT",
      status: "ACTIVE",
      department: "Computer Science",
      semester: 6,
      emailVerified: new Date(),
    },
  });

  const subjects = await Promise.all(
    [
      ["Operating Systems", "Computer Science", 6],
      ["Database Management Systems", "Computer Science", 5],
      ["Data Structures", "Computer Science", 3],
      ["Computer Networks", "Computer Science", 6],
      ["Theory of Computation", "Computer Science", 5],
    ].map(([name, department, semester]) =>
      prisma.subject.create({
        data: { name: String(name), department: String(department), semester: Number(semester) },
      }),
    ),
  );

  const [os, dbms, dsa, cn] = subjects;
  const uploadRoot = path.resolve(process.env.UPLOAD_DIR ?? "./uploads");

  const notesSeed = [
    {
      title: "Operating Systems Unit 3 Notes",
      description:
        "Deadlock conditions, prevention, avoidance, Banker's algorithm, and resource allocation graphs with worked examples.",
      subject: os,
      unit: "3",
      tags: ["deadlock", "scheduling", "processes", "banker"],
      downloads: 1203,
      uploader: student,
      lines: [
        "Four necessary conditions: mutual exclusion, hold and wait,",
        "no preemption, and circular wait.",
        "Prevention removes one condition. Avoidance uses Banker's algorithm.",
      ],
    },
    {
      title: "DBMS Normalization Notes",
      description:
        "1NF through BCNF, functional dependencies, and how to decompose relations without losing information.",
      subject: dbms,
      unit: "4",
      tags: ["normalization", "dbms", "bcnf", "dependencies"],
      downloads: 980,
      uploader: peer,
      lines: [
        "Normalization reduces redundancy using functional dependencies.",
        "2NF removes partial dependency. 3NF removes transitive dependency.",
        "BCNF is a stricter form of 3NF.",
      ],
    },
    {
      title: "Data Structures: Trees and Graphs",
      description:
        "Binary trees, BST operations, BFS, DFS, and shortest-path intuition for semester exams.",
      subject: dsa,
      unit: "5",
      tags: ["trees", "graphs", "bfs", "dfs"],
      downloads: 640,
      uploader: student,
      lines: [
        "BFS explores level by level. DFS goes deep first.",
        "BST search is O(h). Balanced trees keep h close to log n.",
      ],
    },
    {
      title: "Computer Networks Layered Architecture",
      description:
        "OSI vs TCP/IP, reliable transfer, congestion control, and routing notes for unit 2.",
      subject: cn,
      unit: "2",
      tags: ["osi", "tcp", "routing", "congestion"],
      downloads: 410,
      uploader: peer,
      lines: [
        "OSI has seven layers. TCP/IP has four.",
        "TCP provides reliability. IP provides best-effort packet delivery.",
      ],
    },
    {
      title: "Operating System Deadlock Prevention Cheatsheet",
      description:
        "Short cheatsheet covering deadlock prevention strategies and comparison with avoidance.",
      subject: os,
      unit: "3",
      tags: ["deadlock", "prevention", "os"],
      downloads: 220,
      uploader: peer,
      lines: [
        "Prevention is conservative. Avoidance is safer with more information.",
        "Detection and recovery is used when deadlocks are rare.",
      ],
    },
  ];

  for (const item of notesSeed) {
    const note = await prisma.note.create({
      data: {
        title: item.title,
        description: item.description,
        fileUrl: "pending",
        fileType: "pdf",
        fileSize: 0,
        resourceType: "NOTES",
        unit: item.unit,
        uploaderId: item.uploader.id,
        subjectId: item.subject.id,
        downloads: item.downloads,
      },
    });
    const dir = path.join(uploadRoot, note.id);
    await mkdir(dir, { recursive: true });
    const filename = "notes.pdf";
    const buffer = pdf(item.title, item.lines);
    await writeFile(path.join(dir, filename), buffer);
    await prisma.note.update({
      where: { id: note.id },
      data: { fileUrl: `${note.id}/${filename}`, fileSize: buffer.length },
    });
    for (const name of item.tags) {
      const tag = await prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      await prisma.noteTag.create({ data: { noteId: note.id, tagId: tag.id } });
    }
  }

  const allNotes = await prisma.note.findMany();
  await prisma.rating.create({
    data: { userId: peer.id, noteId: allNotes[0].id, rating: 5, helpful: true },
  });
  await prisma.rating.create({
    data: { userId: student.id, noteId: allNotes[1].id, rating: 4, helpful: true },
  });
  await prisma.rating.create({
    data: { userId: admin.id, noteId: allNotes[0].id, rating: 5, helpful: true },
  });

  await prisma.trustedDomain.createMany({
    data: [
      { domain: "mit.edu", label: "MIT", boost: 1.4 },
      { domain: "stanford.edu", label: "Stanford", boost: 1.4 },
      { domain: "nptel.ac.in", label: "NPTEL", boost: 1.35 },
      { domain: "ocw.mit.edu", label: "MIT OCW", boost: 1.4 },
      { domain: "wikipedia.org", label: "Wikipedia", boost: 1.15 },
      { domain: "openlibrary.org", label: "Open Library", boost: 1.2 },
      { domain: "khanacademy.org", label: "Khan Academy", boost: 1.25 },
    ],
  });

  await prisma.externalResource.createMany({
    data: [
      {
        title: "Deadlock (computer science)",
        url: "https://en.wikipedia.org/wiki/Deadlock_(computer_science)",
        domain: "en.wikipedia.org",
        description: "Encyclopedia article covering deadlock conditions and handling strategies.",
        sourceType: "oer",
      },
      {
        title: "MIT OCW Operating System Engineering",
        url: "https://ocw.mit.edu/courses/6-828-operating-system-engineering-fall-2012/",
        domain: "ocw.mit.edu",
        description: "University course materials for operating systems.",
        sourceType: "university",
      },
      {
        title: "NPTEL Database Management System",
        url: "https://nptel.ac.in/courses/106105175",
        domain: "nptel.ac.in",
        description: "NPTEL lectures and notes on DBMS, including normalization.",
        sourceType: "oer",
      },
      {
        title: "Database normalization",
        url: "https://en.wikipedia.org/wiki/Database_normalization",
        domain: "en.wikipedia.org",
        description: "Overview of normal forms used in relational database design.",
        sourceType: "oer",
      },
    ],
  });

  await prisma.searchEvent.createMany({
    data: [
      { query: "DBMS normalization", resultCount: 8, clicked: true, clickType: "community", userId: student.id },
      { query: "Operating System deadlock", resultCount: 10, clicked: true, clickType: "external", userId: peer.id },
      { query: "computer networks osi", resultCount: 6, clicked: false },
    ],
  });

  console.log("Seeded StudySphere demo data.");
  console.log("Student: student@studysphere.dev / Student123");
  console.log("Admin:   admin@studysphere.dev / Admin123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
