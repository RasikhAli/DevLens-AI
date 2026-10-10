export interface CanonicalSkill {
  name: string;
  category: "Languages" | "Frontend" | "Backend" | "Databases" | "Cloud & DevOps" | "Testing" | "Architecture" | "Tools";
  aliases: string[];
  relatedSkills?: string[]; // Related skills for semantic similarity calculation (e.g. Express -> Fastify, React -> Vue)
}

export const SKILL_TAXONOMY: CanonicalSkill[] = [
  // Languages
  { name: "TypeScript", category: "Languages", aliases: ["ts", "typescript.js"], relatedSkills: ["JavaScript"] },
  { name: "JavaScript", category: "Languages", aliases: ["js", "es6", "esnext", "ecmascript"], relatedSkills: ["TypeScript"] },
  { name: "Python", category: "Languages", aliases: ["py", "python3"], relatedSkills: [] },
  { name: "Go", category: "Languages", aliases: ["golang"], relatedSkills: ["Rust", "C++"] },
  { name: "Rust", category: "Languages", aliases: ["rs", "rust-lang"], relatedSkills: ["C++", "Go"] },
  { name: "Java", category: "Languages", aliases: ["jvm", "java8", "java17", "java21"], relatedSkills: ["Kotlin", "Scala"] },
  { name: "Kotlin", category: "Languages", aliases: ["kt"], relatedSkills: ["Java"] },
  { name: "C++", category: "Languages", aliases: ["cpp", "cplusplus"], relatedSkills: ["C", "Rust"] },
  { name: "C#", category: "Languages", aliases: ["csharp", "dotnet", ".net"], relatedSkills: ["Java"] },
  { name: "PHP", category: "Languages", aliases: ["php7", "php8"], relatedSkills: [] },
  { name: "Ruby", category: "Languages", aliases: ["rb"], relatedSkills: [] },
  { name: "SQL", category: "Languages", aliases: ["structured query language"], relatedSkills: ["PostgreSQL", "MySQL"] },

  // Frontend
  { name: "React", category: "Frontend", aliases: ["react.js", "reactjs"], relatedSkills: ["Next.js", "Vue.js", "Svelte"] },
  { name: "Next.js", category: "Frontend", aliases: ["next", "nextjs"], relatedSkills: ["React"] },
  { name: "Vue.js", category: "Frontend", aliases: ["vue", "vuejs", "vue3", "nuxt", "nuxtjs"], relatedSkills: ["React"] },
  { name: "Svelte", category: "Frontend", aliases: ["sveltejs", "sveltekit"], relatedSkills: ["Vue.js", "React"] },
  { name: "Angular", category: "Frontend", aliases: ["angular.js", "angularjs", "angular2+"], relatedSkills: ["React", "TypeScript"] },
  { name: "Tailwind CSS", category: "Frontend", aliases: ["tailwind", "tailwindcss"], relatedSkills: ["CSS", "SCSS"] },
  { name: "HTML", category: "Frontend", aliases: ["html5"], relatedSkills: ["CSS"] },
  { name: "CSS", category: "Frontend", aliases: ["css3", "styles"], relatedSkills: ["SCSS", "Tailwind CSS"] },
  { name: "Redux", category: "Frontend", aliases: ["redux-toolkit", "rtk"], relatedSkills: ["Zustand", "React"] },
  { name: "Zustand", category: "Frontend", aliases: [], relatedSkills: ["Redux"] },

  // Backend
  { name: "Node.js", category: "Backend", aliases: ["node", "nodejs"], relatedSkills: ["Express.js", "NestJS", "Fastify"] },
  { name: "Express.js", category: "Backend", aliases: ["express", "expressjs"], relatedSkills: ["Fastify", "Koa", "NestJS"] },
  { name: "NestJS", category: "Backend", aliases: ["nest", "nest.js"], relatedSkills: ["Express.js", "TypeScript"] },
  { name: "FastAPI", category: "Backend", aliases: ["fastapi-py"], relatedSkills: ["Flask", "Django", "Python"] },
  { name: "Django", category: "Backend", aliases: ["django-rest-framework", "drf"], relatedSkills: ["Flask", "FastAPI"] },
  { name: "Flask", category: "Backend", aliases: [], relatedSkills: ["FastAPI", "Django"] },
  { name: "Spring Boot", category: "Backend", aliases: ["spring", "springboot"], relatedSkills: ["Java"] },
  { name: "GraphQL", category: "Backend", aliases: ["apollo", "graphql-api"], relatedSkills: ["REST API"] },
  { name: "REST API", category: "Backend", aliases: ["rest", "restful", "restful apis"], relatedSkills: ["GraphQL", "gRPC"] },
  { name: "gRPC", category: "Backend", aliases: ["protobuf", "protocol buffers"], relatedSkills: ["REST API"] },

  // Databases
  { name: "PostgreSQL", category: "Databases", aliases: ["postgres", "pgsql", "psql"], relatedSkills: ["MySQL", "SQL"] },
  { name: "MySQL", category: "Databases", aliases: ["mariadb"], relatedSkills: ["PostgreSQL", "SQL"] },
  { name: "MongoDB", category: "Databases", aliases: ["mongo"], relatedSkills: ["DynamoDB"] },
  { name: "Redis", category: "Databases", aliases: ["valkey", "redis-cache"], relatedSkills: ["Memcached"] },
  { name: "Prisma", category: "Databases", aliases: ["prisma orm", "prismajs"], relatedSkills: ["Drizzle ORM", "TypeORM"] },
  { name: "Drizzle ORM", category: "Databases", aliases: ["drizzle"], relatedSkills: ["Prisma"] },
  { name: "SQLite", category: "Databases", aliases: ["sqlite3"], relatedSkills: ["PostgreSQL"] },
  { name: "Elasticsearch", category: "Databases", aliases: ["elastic", "opensearch"], relatedSkills: ["Redis"] },

  // Cloud & DevOps
  { name: "Docker", category: "Cloud & DevOps", aliases: ["docker container", "containerization"], relatedSkills: ["Kubernetes"] },
  { name: "Kubernetes", category: "Cloud & DevOps", aliases: ["k8s", "kube"], relatedSkills: ["Docker"] },
  { name: "AWS", category: "Cloud & DevOps", aliases: ["amazon web services", "ec2", "s3", "lambda"], relatedSkills: ["GCP", "Azure"] },
  { name: "GCP", category: "Cloud & DevOps", aliases: ["google cloud", "google cloud platform"], relatedSkills: ["AWS"] },
  { name: "Azure", category: "Cloud & DevOps", aliases: ["microsoft azure"], relatedSkills: ["AWS"] },
  { name: "CI/CD", category: "Cloud & DevOps", aliases: ["github actions", "gitlab ci", "continuous integration", "cd"], relatedSkills: ["Docker"] },
  { name: "Terraform", category: "Cloud & DevOps", aliases: ["iac", "infrastructure as code"], relatedSkills: ["AWS"] },
  { name: "Linux", category: "Cloud & DevOps", aliases: ["ubuntu", "debian", "bash", "shell"], relatedSkills: [] },

  // Testing
  { name: "Jest", category: "Testing", aliases: [], relatedSkills: ["Vitest", "Mocha"] },
  { name: "Vitest", category: "Testing", aliases: [], relatedSkills: ["Jest"] },
  { name: "Playwright", category: "Testing", aliases: ["playwright-test"], relatedSkills: ["Cypress", "Selenium"] },
  { name: "Cypress", category: "Testing", aliases: [], relatedSkills: ["Playwright"] },
  { name: "PyTest", category: "Testing", aliases: ["pytest-py"], relatedSkills: ["UnitTest"] },
  { name: "Unit Testing", category: "Testing", aliases: ["unit tests", "automated testing", "test automation", "tdd"], relatedSkills: ["Jest", "Vitest"] },
  { name: "Integration Testing", category: "Testing", aliases: ["integration tests", "e2e testing"], relatedSkills: ["Playwright"] },

  // Tools & Architecture
  { name: "Git", category: "Tools", aliases: ["github", "gitlab", "version control"], relatedSkills: [] },
  { name: "Microservices", category: "Architecture", aliases: ["distributed systems", "event-driven architecture"], relatedSkills: ["Docker", "Kubernetes"] },
  { name: "Kafka", category: "Architecture", aliases: ["apache kafka"], relatedSkills: ["RabbitMQ", "Redis"] },
  { name: "RabbitMQ", category: "Architecture", aliases: ["amqp"], relatedSkills: ["Kafka"] },
];
