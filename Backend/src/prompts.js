export const templatePrompt = `
  Respond just in one words
  ReactJS or NodeJS

  Your response should be answer to the what it best to built the web application, which user asked for.

  user asked for : 
`

export const reactTemplate = `
  Include files :
    ".eslintrc.cjs",
    ".gitignore",
    "package.json",
    "index.html",
    "postcss.config.js",
    "tailwind.config.js",
    "vite.config.js",
    ".env.sample"
  and etc, in the root.

  Include "src" directory in the root, which contains files : 
    "App.jsx",
    "main.jsx",
    "global.css",
  and etc.

  Include "public" directory in the root, which contains file : 
    "vite.svg".
  
  Include "assets" directory in the src, which contains file : 
    "react.svg".
`

export const nextTemplate = `
  Include files :
    ".eslintrc.json",
    ".gitignore",
    "next-env.d.ts",
    "next.config.ts",
    "package.json",
    "postcss.config.mjs",
    "tailwind.config.ts",
    "tsconfig.json",
    ".env.sample"
  and etc, in the root.

  Include "src" directory in the root.

  Include "app" directory in the src, which contains files :
    "favicon.io",
    "global.css",
    "layout.tsx",
    "page.tsx"

  Include "public" directory in the root, which contains file :
    "globe.svg",
    "next.svg"
    "vercel.svg"
`

export const nodeTemplate = `
  Include files :
    "index.js",
    "package.json",
  and etc, in the root.
`

export const basePrompt = (template) => `
    You are an excellent software developer.
  You have a task of creating a web application.
  ${
    template == "ReactJS" || "NextJS" ?
      "The web application frontend should be beautiful , responsive and user friendly. User should be able to interact with the application easily. Use the demo images and icons, available on internet in the application. Use best font styles and colors in the application."
      :
      ""
    }
  You should give me the entire codes for all the files required to build this application.
  Your response should be in the specific format as shown below.

  ${template ? `You should build this application in ${template}.

  Your application should contain all basic files required to build this application.
  like
  ${template === 'ReactJS' ? reactTemplate : template === 'NextJS' ? nextTemplate : template === 'NodeJS' ? nodeTemplate : ""}` : ""}

  Consider following things to avoid errors in application:
    1. The application should contain all the files required to build this application.
    2. The files should be mentioned in the specific format.
    3. Make sure you provide the files, which you have imported in other files.
  
  Make sure you create a beautiful, responsive and user friendly web application, with fantastic and interactive ui/ux.
  Make sure you include all the packages latest versions in the package.json file, which you have used in the application.

  you should provide the entire code for all the files required to build this application.
  Do not provide any unnecessary information, diverting from givem format.

  Now, your task is to : 
`

export const modificationPrompt = (codes) => `
  ${basePrompt()} Modify the following code to statisfy some demands.
  Remember, to only return the files which are modified, and files which are to be added. Do not remove any file.
  ${codes}
  Demands are : 
`