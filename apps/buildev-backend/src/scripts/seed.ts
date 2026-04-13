import { prisma } from "../services/db";
import bcrypt from "bcryptjs";

async function main() {
    const siteName = "Buildersite Dev";
    const email = "admin@buildersite.dev";
    const password = "admin123";

    console.log("🌱 Starting seed...");

    // Check if site exists
    let site = await prisma.site.findFirst({
        where: { name: siteName }
    });

    if (!site) {
        site = await prisma.site.create({
            data: {
                name: siteName,
                defaultLocale: "es",
                domain: "localhost"
            }
        });
        console.log(`✅ Created site: ${site.name} (${site.id})`);
    } else {
        console.log(`ℹ️ Site already exists: ${site.name} (${site.id})`);
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        const passwordHash = await bcrypt.hash(password, 10);
        user = await prisma.user.create({
            data: {
                name: "Admin User",
                email,
                passwordHash,
                role: "admin",
                siteId: site.id
            }
        });
        console.log(`✅ Created user: ${user.email} (${user.id})`);
    } else {
        console.log(`ℹ️ User already exists: ${user.email} (${user.id})`);
    }

    // Create active home page
    const homePage = await prisma.page.findFirst({
        where: { siteId: site.id, urlPath: "/" }
    });

    if (!homePage) {
        await prisma.page.create({
            data: {
                siteId: site.id,
                name: "Home",
                urlPath: "/",
                title: "Welcome to Buildersite",
                status: "draft",
                blocksJson: JSON.stringify([
                    {
                        id: "1",
                        type: "section",
                        props: { padding: "80px 20px", background: "#f8fafc" },
                        children: [
                            {
                                id: "2",
                                type: "heading",
                                props: { content: "Build your dream site", level: 1, color: "#1e293b" }
                            },
                            {
                                id: "3",
                                type: "text",
                                props: { content: "Drag and drop components to start building.", fontSize: 18 }
                            }
                        ]
                    }
                ])
            }
        });
        console.log("✅ Created initial home page");
    }

    console.log("🚀 Seed finished successfully.");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:");
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
