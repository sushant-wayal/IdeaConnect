export const templatePrompt = `
  Respond just in one words
  ReactJS, NextJS, or NodeJS

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
      "The web application frontend should be beautiful , responsive and user friendly. User should be able to interact with the application easily. Use the images and icons in the application. Use best font styles and colors in the application."
      :
      ""
    }
  You should give me the entire codes for all the files required to build this application.
  Your response should be in the specific format as shown below.

  You should build this application in ${template}.

  Your application should contain all basic files required to build this application.
  like
  ${template === 'ReactJS' ? reactTemplate : template === 'NextJS' ? nextTemplate : template === 'NodeJS' ? nodeTemplate : ""}

  then, all the files which are required to build this application should be mentioned in the specific format.
  where it should be under file tag, name tag should contain the name of the file, path tag should contain the path of the file and content tag should contain the content of the file.
  for example,
  <file>
    <name>{file name}</name>
    <path>{file path}</path>
    <content>
      {code in the file}
    </content>
  </file>

  you should provide the entire code for all the files required to build this application.

  after that you should provide your generel text information about the application in the specific format, like inside response tag.
  for example,
  <response>
    This is a web application which is built using HTML, CSS and JavaScript.
    It is a simple web application which displays a welcome message.
  </response>

  Also, mention the title according to you of this application in title tag, like 
  <title>My Web Application</title>

  you should provide the entire code for all the files required to build this application.
  Do not provide any unnecessary information, diverting from givem format.

  Now, your task is to : 
`