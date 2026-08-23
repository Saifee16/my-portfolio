export const siteDefaults = {
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  name: "Saifullah Suleman",
  email: "imsaifq1@gmail.com",
  github: "https://github.com/Saifee16",
  linkedin: "https://www.linkedin.com/in/saifullah-suleman/",
} as const;
