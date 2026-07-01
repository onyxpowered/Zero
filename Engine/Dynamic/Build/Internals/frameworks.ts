import type { ZeroFramework } from './types.js'

export const zeroFrameworks: readonly ZeroFramework[] = [
  {
    "name": "Container",
    "slug": "container",
    "tagline": "Deploy any project as a container image built from a Dockerfile.",
    "description": "A project deployed as a container image, built from a Dockerfile.vercel or Containerfile.vercel.",
    "runtimeFramework": true,
    "detectors": {
      "some": [
        {
          "path": "Dockerfile.vercel"
        },
        {
          "path": "Containerfile.vercel"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "None",
        "value": null
      },
      "buildCommand": {
        "placeholder": "None",
        "value": null
      },
      "devCommand": {
        "placeholder": "None",
        "value": null
      },
      "outputDirectory": {
        "placeholder": "None"
      }
    }
  },
  {
    "name": "Blitz.js (Legacy)",
    "slug": "blitzjs",
    "tagline": "Blitz.js: The Fullstack React Framework",
    "description": "A brand new Blitz.js app - the result of running `npx blitz@0.45.4 new`.",
    "envPrefix": "NEXT_PUBLIC_",
    "detectors": {
      "some": [
        {
          "path": "blitz.config.js"
        },
        {
          "path": "blitz.config.ts"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `blitz build`",
        "value": "blitz build"
      },
      "devCommand": {
        "value": "blitz start"
      },
      "outputDirectory": {
        "placeholder": "Next.js default"
      }
    },
    "engine": "node"
  },
  {
    "name": "Next.js",
    "slug": "nextjs",
    "tagline": "Next.js makes you productive with React instantly — whether you want to build static or dynamic sites.",
    "description": "A Next.js app and a Serverless Function API.",
    "envPrefix": "NEXT_PUBLIC_",
    "sort": 1,
    "detectors": {
      "every": [
        {
          "matchPackage": "next"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `next build`",
        "value": "next build"
      },
      "devCommand": {
        "value": "next dev --port $PORT",
        "placeholder": "next"
      },
      "outputDirectory": {
        "placeholder": "Next.js default"
      }
    },
    "engine": "node"
  },
  {
    "name": "Gatsby.js",
    "slug": "gatsby",
    "tagline": "Gatsby helps developers build blazing fast websites and apps with React.",
    "description": "A Gatsby starter app with an API Route.",
    "envPrefix": "GATSBY_",
    "sort": 5,
    "detectors": {
      "every": [
        {
          "matchPackage": "gatsby"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `gatsby build`",
        "value": "gatsby build"
      },
      "devCommand": {
        "value": "gatsby develop --port $PORT",
        "placeholder": "gatsby develop"
      },
      "outputDirectory": {
        "value": "public"
      }
    },
    "engine": "node"
  },
  {
    "name": "Remix",
    "slug": "remix",
    "tagline": "Build Better Websites",
    "description": "A new Remix app — the result of running `npx create-remix`.",
    "sort": 6,
    "supersedes": [
      "hydrogen",
      "vite",
      "node"
    ],
    "detectors": {
      "some": [
        {
          "matchPackage": "@remix-run/dev"
        },
        {
          "path": "remix.config.js"
        },
        {
          "path": "remix.config.mjs"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "value": "remix build",
        "placeholder": "`npm run build` or `remix build`"
      },
      "devCommand": {
        "value": "remix dev",
        "placeholder": "remix dev"
      },
      "outputDirectory": {
        "value": "public"
      }
    },
    "engine": "node"
  },
  {
    "name": "React Router",
    "slug": "react-router",
    "tagline": "Declarative routing for React",
    "description": "A user-obsessed, standards-focused, multi-strategy router you can deploy anywhere.",
    "sort": 7,
    "supersedes": [
      "hydrogen",
      "vite",
      "node"
    ],
    "detectors": {
      "some": [
        {
          "path": "vite.config.js",
          "matchContent": "@react-router/dev/vite"
        },
        {
          "path": "vite.config.ts",
          "matchContent": "@react-router/dev/vite"
        },
        {
          "path": "react-router.config.js"
        },
        {
          "path": "react-router.config.ts"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "value": "react-router build",
        "placeholder": "`npm run build` or `react-router build`"
      },
      "devCommand": {
        "value": "react-router dev",
        "placeholder": "react-router dev"
      },
      "outputDirectory": {
        "value": "build"
      }
    },
    "engine": "node"
  },
  {
    "name": "Astro",
    "slug": "astro",
    "tagline": "Astro is a new kind of static site builder for the modern web. Powerful developer experience meets lightweight output.",
    "description": "An Astro site, using the basics starter kit.",
    "envPrefix": "PUBLIC_",
    "detectors": {
      "every": [
        {
          "matchPackage": "astro"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "value": "astro build",
        "placeholder": "`npm run build` or `astro build`"
      },
      "devCommand": {
        "value": "astro dev --port $PORT",
        "placeholder": "astro dev"
      },
      "outputDirectory": {
        "value": "dist"
      }
    },
    "engine": "node"
  },
  {
    "name": "Hexo",
    "slug": "hexo",
    "tagline": "Hexo is a fast, simple & powerful blog framework powered by Node.js.",
    "description": "A Hexo site, created with the Hexo CLI.",
    "detectors": {
      "every": [
        {
          "matchPackage": "hexo"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `hexo generate`",
        "value": "hexo generate"
      },
      "devCommand": {
        "value": "hexo server --port $PORT",
        "placeholder": "hexo server"
      },
      "outputDirectory": {
        "value": "public"
      }
    },
    "engine": "node"
  },
  {
    "name": "Eleventy",
    "slug": "eleventy",
    "tagline": "11ty is a simpler static site generator written in JavaScript, created to be an alternative to Jekyll.",
    "description": "An Eleventy site, created with npm init.",
    "detectors": {
      "every": [
        {
          "matchPackage": "@11ty/eleventy"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `npx @11ty/eleventy`",
        "value": "npx @11ty/eleventy"
      },
      "devCommand": {
        "value": "npx @11ty/eleventy --serve --watch --port $PORT",
        "placeholder": "npx @11ty/eleventy --serve"
      },
      "outputDirectory": {
        "value": "_site"
      }
    },
    "engine": "node"
  },
  {
    "name": "Docusaurus (v2+)",
    "slug": "docusaurus-2",
    "tagline": "Docusaurus makes it easy to maintain Open Source documentation websites.",
    "description": "A static Docusaurus site that makes it easy to maintain OSS documentation.",
    "detectors": {
      "some": [
        {
          "matchPackage": "@docusaurus/core"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `docusaurus build`",
        "value": "docusaurus build"
      },
      "devCommand": {
        "value": "docusaurus start --port $PORT",
        "placeholder": "docusaurus start"
      },
      "outputDirectory": {
        "value": "build"
      }
    },
    "engine": "node"
  },
  {
    "name": "Docusaurus (v1)",
    "slug": "docusaurus",
    "tagline": "Docusaurus makes it easy to maintain Open Source documentation websites.",
    "description": "A static Docusaurus site that makes it easy to maintain OSS documentation.",
    "detectors": {
      "some": [
        {
          "matchPackage": "docusaurus"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `docusaurus-build`",
        "value": "docusaurus-build"
      },
      "devCommand": {
        "value": "docusaurus-start --port $PORT",
        "placeholder": "docusaurus-start"
      },
      "outputDirectory": {
        "value": "build"
      }
    },
    "engine": "node"
  },
  {
    "name": "Preact",
    "slug": "preact",
    "tagline": "Preact is a fast 3kB alternative to React with the same modern API.",
    "description": "A Preact app, created with the Preact CLI.",
    "detectors": {
      "every": [
        {
          "matchPackage": "preact-cli"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `preact build`",
        "value": "preact build"
      },
      "devCommand": {
        "value": "preact watch --port $PORT",
        "placeholder": "preact watch"
      },
      "outputDirectory": {
        "value": "build"
      }
    },
    "engine": "node"
  },
  {
    "name": "SolidStart (v1)",
    "slug": "solidstart-1",
    "tagline": "Simple and performant reactivity for building user interfaces.",
    "description": "A Solid app, created with SolidStart.",
    "envPrefix": "VITE_",
    "detectors": {
      "every": [
        {
          "matchPackage": "solid-js"
        },
        {
          "matchPackage": "@solidjs/start"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `vinxi build`",
        "value": "vinxi build"
      },
      "devCommand": {
        "value": "vinxi dev"
      },
      "outputDirectory": {
        "value": ".output"
      }
    },
    "engine": "node"
  },
  {
    "name": "SolidStart (v0)",
    "slug": "solidstart",
    "tagline": "Simple and performant reactivity for building user interfaces.",
    "description": "A Solid app, created with SolidStart.",
    "envPrefix": "VITE_",
    "sort": 98,
    "detectors": {
      "every": [
        {
          "matchPackage": "solid-js"
        },
        {
          "matchPackage": "solid-start"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `solid-start build`",
        "value": "solid-start build"
      },
      "devCommand": {
        "value": "solid-start dev"
      },
      "outputDirectory": {
        "value": ".output"
      }
    },
    "engine": "node"
  },
  {
    "name": "Dojo",
    "slug": "dojo",
    "tagline": "Dojo is a modern progressive, TypeScript first framework.",
    "description": "A Dojo app, created with the Dojo CLI's cli-create-app command.",
    "detectors": {
      "some": [
        {
          "matchPackage": "@dojo/framework"
        },
        {
          "path": ".dojorc"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `dojo build`",
        "value": "dojo build"
      },
      "devCommand": {
        "value": "dojo build -m dev -w -s -p $PORT",
        "placeholder": "dojo build -m dev -w -s"
      },
      "outputDirectory": {
        "value": "output/dist"
      }
    },
    "engine": "node"
  },
  {
    "name": "Ember.js",
    "slug": "ember",
    "tagline": "Ember.js helps webapp developers be more productive out of the box.",
    "description": "An Ember app, created with the Ember CLI.",
    "detectors": {
      "some": [
        {
          "matchPackage": "ember-source"
        },
        {
          "matchPackage": "ember-cli"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `ember build`",
        "value": "ember build"
      },
      "devCommand": {
        "value": "ember serve --port $PORT",
        "placeholder": "ember serve"
      },
      "outputDirectory": {
        "value": "dist"
      }
    },
    "engine": "node"
  },
  {
    "name": "Vue.js",
    "slug": "vue",
    "tagline": "Vue.js is a versatile JavaScript framework that is as approachable as it is performant.",
    "description": "A Vue.js app, created with the Vue CLI.",
    "envPrefix": "VUE_APP_",
    "detectors": {
      "every": [
        {
          "matchPackage": "@vue/cli-service"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `vue-cli-service build`",
        "value": "vue-cli-service build"
      },
      "devCommand": {
        "value": "vue-cli-service serve --port $PORT",
        "placeholder": "vue-cli-service serve"
      },
      "outputDirectory": {
        "value": "dist"
      }
    },
    "engine": "node"
  },
  {
    "name": "Scully",
    "slug": "scully",
    "tagline": "Scully is a static site generator for Angular.",
    "description": "The Static Site Generator for Angular apps.",
    "detectors": {
      "every": [
        {
          "matchPackage": "@scullyio/init"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `ng build && scully`",
        "value": "ng build && scully"
      },
      "devCommand": {
        "value": "ng serve --port $PORT",
        "placeholder": "ng serve"
      },
      "outputDirectory": {
        "value": "dist"
      }
    },
    "engine": "node"
  },
  {
    "name": "Ionic Angular",
    "slug": "ionic-angular",
    "tagline": "Ionic Angular allows you to build mobile PWAs with Angular and the Ionic Framework.",
    "description": "An Ionic Angular site, created with the Ionic CLI.",
    "detectors": {
      "every": [
        {
          "matchPackage": "@ionic/angular"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `ng build`",
        "value": "ng build"
      },
      "devCommand": {
        "value": "ng serve --port $PORT"
      },
      "outputDirectory": {
        "value": "www"
      }
    },
    "engine": "node"
  },
  {
    "name": "Angular",
    "slug": "angular",
    "tagline": "Angular is a TypeScript-based cross-platform framework from Google.",
    "description": "An Angular app, created with the Angular CLI.",
    "detectors": {
      "every": [
        {
          "matchPackage": "@angular/cli"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `ng build`",
        "value": "ng build"
      },
      "devCommand": {
        "value": "ng serve --port $PORT",
        "placeholder": "ng serve"
      },
      "outputDirectory": {
        "value": "dist"
      }
    },
    "engine": "node"
  },
  {
    "name": "Polymer",
    "slug": "polymer",
    "tagline": "Polymer is an open-source webapps library from Google, for building using Web Components.",
    "description": "A Polymer app, created with the Polymer CLI.",
    "detectors": {
      "every": [
        {
          "matchPackage": "polymer-cli"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `polymer build`",
        "value": "polymer build"
      },
      "devCommand": {
        "value": "polymer serve --port $PORT",
        "placeholder": "polymer serve"
      },
      "outputDirectory": {
        "value": "build"
      }
    },
    "engine": "node"
  },
  {
    "name": "Svelte",
    "slug": "svelte",
    "tagline": "Svelte lets you write high performance reactive apps with significantly less boilerplate.",
    "description": "A basic Svelte app using the default template.",
    "sort": 3,
    "detectors": {
      "every": [
        {
          "matchPackage": "svelte"
        },
        {
          "matchPackage": "sirv-cli"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `rollup -c`",
        "value": "rollup -c"
      },
      "devCommand": {
        "value": "rollup -c -w"
      },
      "outputDirectory": {
        "value": "public"
      }
    },
    "engine": "node"
  },
  {
    "name": "SvelteKit (v0)",
    "slug": "sveltekit",
    "tagline": "SvelteKit is a framework for building web applications of all sizes.",
    "description": "A SvelteKit legacy app optimized Edge-first.",
    "envPrefix": "VITE_",
    "sort": 99,
    "supersedes": [
      "vite"
    ],
    "detectors": {
      "every": [
        {
          "path": "package.json",
          "matchContent": "\"(dev)?(d|D)ependencies\":\\s*{[^}]*\"@sveltejs\\/kit\":\\s*\"1\\.0\\.0-next\\.(\\d+)\"[^}]*}"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `svelte-kit build`",
        "value": "svelte-kit build"
      },
      "devCommand": {
        "value": "svelte-kit dev --port $PORT",
        "placeholder": "svelte-kit dev"
      },
      "outputDirectory": {
        "value": "public"
      }
    },
    "engine": "node"
  },
  {
    "name": "SvelteKit",
    "slug": "sveltekit-1",
    "tagline": "SvelteKit is a framework for building web applications of all sizes.",
    "description": "A SvelteKit app optimized Edge-first.",
    "supersedes": [
      "vite"
    ],
    "detectors": {
      "every": [
        {
          "path": "package.json",
          "matchContent": "\"(dev)?(d|D)ependencies\":\\s*{[^}]*\"@sveltejs\\/kit\":\\s*\".+?\"[^}]*}"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "vite build",
        "value": "vite build"
      },
      "devCommand": {
        "placeholder": "vite dev",
        "value": "vite dev --port $PORT"
      },
      "outputDirectory": {
        "value": "public"
      }
    },
    "engine": "node"
  },
  {
    "name": "Ionic React",
    "slug": "ionic-react",
    "tagline": "Ionic React allows you to build mobile PWAs with React and the Ionic Framework.",
    "description": "An Ionic React site, created with the Ionic CLI.",
    "detectors": {
      "every": [
        {
          "matchPackage": "@ionic/react"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `react-scripts build`",
        "value": "react-scripts build"
      },
      "devCommand": {
        "value": "react-scripts start"
      },
      "outputDirectory": {
        "value": "build"
      }
    },
    "engine": "node"
  },
  {
    "name": "Create React App",
    "slug": "create-react-app",
    "tagline": "Create React App allows you to get going with React in no time.",
    "description": "A client-side React app created with create-react-app.",
    "envPrefix": "REACT_APP_",
    "sort": 4,
    "detectors": {
      "some": [
        {
          "matchPackage": "react-scripts"
        },
        {
          "matchPackage": "react-dev-utils"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `react-scripts build`",
        "value": "react-scripts build"
      },
      "devCommand": {
        "value": "react-scripts start"
      },
      "outputDirectory": {
        "value": "build"
      }
    },
    "engine": "node"
  },
  {
    "name": "Gridsome",
    "slug": "gridsome",
    "tagline": "Gridsome is a Vue.js-powered framework for building websites & apps that are fast by default.",
    "description": "A Gridsome app, created with the Gridsome CLI.",
    "detectors": {
      "every": [
        {
          "matchPackage": "gridsome"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `gridsome build`",
        "value": "gridsome build"
      },
      "devCommand": {
        "value": "gridsome develop -p $PORT",
        "placeholder": "gridsome develop"
      },
      "outputDirectory": {
        "value": "dist"
      }
    },
    "engine": "node"
  },
  {
    "name": "UmiJS",
    "slug": "umijs",
    "tagline": "UmiJS is an extensible enterprise-level React application framework.",
    "description": "An UmiJS app, created using the Umi CLI.",
    "detectors": {
      "every": [
        {
          "matchPackage": "umi"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `umi build`",
        "value": "umi build"
      },
      "devCommand": {
        "value": "umi dev --port $PORT",
        "placeholder": "umi dev"
      },
      "outputDirectory": {
        "value": "dist"
      }
    },
    "engine": "node"
  },
  {
    "name": "Sapper",
    "slug": "sapper",
    "tagline": "Sapper is a framework for building high-performance universal web apps with Svelte.",
    "description": "A Sapper app, using the Sapper template.",
    "detectors": {
      "every": [
        {
          "matchPackage": "sapper"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `sapper export`",
        "value": "sapper export"
      },
      "devCommand": {
        "value": "sapper dev --port $PORT",
        "placeholder": "sapper dev"
      },
      "outputDirectory": {
        "value": "__sapper__/export"
      }
    },
    "engine": "node"
  },
  {
    "name": "Saber",
    "slug": "saber",
    "tagline": "Saber is a framework for building static sites in Vue.js that supports data from any source.",
    "description": "A Saber site, created with npm init.",
    "detectors": {
      "every": [
        {
          "matchPackage": "saber"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `saber build`",
        "value": "saber build"
      },
      "devCommand": {
        "value": "saber --port $PORT",
        "placeholder": "saber"
      },
      "outputDirectory": {
        "value": "public"
      }
    },
    "engine": "node"
  },
  {
    "name": "Stencil",
    "slug": "stencil",
    "tagline": "Stencil is a powerful toolchain for building Progressive Web Apps and Design Systems.",
    "description": "A Stencil site, created with the Stencil CLI.",
    "detectors": {
      "every": [
        {
          "matchPackage": "@stencil/core"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `stencil build`",
        "value": "stencil build"
      },
      "devCommand": {
        "value": "stencil build --dev --watch --serve --port $PORT",
        "placeholder": "stencil build --dev --watch --serve"
      },
      "outputDirectory": {
        "value": "www"
      }
    },
    "engine": "node"
  },
  {
    "name": "Nuxt",
    "slug": "nuxtjs",
    "tagline": "Nuxt is the open source framework that makes full-stack development with Vue.js intuitive.",
    "description": "A Nuxt app, bootstrapped with create-nuxt-app.",
    "envPrefix": "NUXT_ENV_",
    "sort": 2,
    "supersedes": [
      "nitro"
    ],
    "detectors": {
      "some": [
        {
          "matchPackage": "nuxt"
        },
        {
          "matchPackage": "nuxt3"
        },
        {
          "matchPackage": "nuxt-edge"
        },
        {
          "matchPackage": "nuxt-nightly"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `nuxt build`",
        "value": "nuxt build"
      },
      "devCommand": {
        "value": "nuxt dev"
      },
      "outputDirectory": {
        "value": "dist"
      }
    },
    "engine": "node"
  },
  {
    "name": "RedwoodJS",
    "slug": "redwoodjs",
    "tagline": "RedwoodJS is a full-stack framework for the Jamstack.",
    "description": "A RedwoodJS app, bootstraped with create-redwood-app.",
    "envPrefix": "REDWOOD_ENV_",
    "detectors": {
      "every": [
        {
          "matchPackage": "@redwoodjs/core"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "value": "yarn rw deploy vercel"
      },
      "devCommand": {
        "value": "yarn rw dev --fwd=\"--port=$PORT --open=false\"",
        "placeholder": "yarn rw dev"
      },
      "outputDirectory": {
        "placeholder": "RedwoodJS default"
      }
    },
    "engine": "node"
  },
  {
    "name": "Hugo",
    "slug": "hugo",
    "tagline": "Hugo is the world’s fastest framework for building websites, written in Go.",
    "description": "A Hugo site, created with the Hugo CLI.",
    "detectors": {
      "some": [
        {
          "path": "config.yaml",
          "matchContent": "baseURL"
        },
        {
          "path": "config.toml",
          "matchContent": "baseURL"
        },
        {
          "path": "config.json",
          "matchContent": "baseURL"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "None"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `hugo --gc`",
        "value": "hugo --gc"
      },
      "devCommand": {
        "value": "hugo server -D -w -p $PORT",
        "placeholder": "hugo server -D"
      },
      "outputDirectory": {
        "placeholder": "`public` or `publishDir` from the `config` file"
      }
    },
    "engine": "go"
  },
  {
    "name": "Jekyll",
    "slug": "jekyll",
    "tagline": "Jekyll makes it super easy to transform your plain text into static websites and blogs.",
    "description": "A Jekyll site, created with the Jekyll CLI.",
    "detectors": {
      "every": [
        {
          "path": "_config.yml"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "value": "bundle install"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `jekyll build`",
        "value": "jekyll build"
      },
      "devCommand": {
        "value": "bundle exec jekyll serve --watch --port $PORT",
        "placeholder": "bundle exec jekyll serve"
      },
      "outputDirectory": {
        "placeholder": "`_site` or `destination` from `_config.yml`"
      }
    },
    "engine": "ruby"
  },
  {
    "name": "Brunch",
    "slug": "brunch",
    "tagline": "Brunch is a fast and simple webapp build tool with seamless incremental compilation for rapid development.",
    "description": "A Brunch app, created with the Brunch CLI.",
    "detectors": {
      "some": [
        {
          "matchPackage": "brunch"
        },
        {
          "path": "brunch-config.js"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `brunch build --production`",
        "value": "brunch build --production"
      },
      "devCommand": {
        "value": "brunch watch --server --port $PORT",
        "placeholder": "brunch watch --server"
      },
      "outputDirectory": {
        "value": "public"
      }
    },
    "engine": "node"
  },
  {
    "name": "Middleman",
    "slug": "middleman",
    "tagline": "Middleman is a static site generator that uses all the shortcuts and tools in modern web development.",
    "description": "A Middleman app, created with the Middleman CLI.",
    "detectors": {
      "every": [
        {
          "path": "config.rb"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "value": "bundle install"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `bundle exec middleman build`",
        "value": "bundle exec middleman build"
      },
      "devCommand": {
        "placeholder": "bundle exec middleman server",
        "value": "bundle exec middleman server -p $PORT"
      },
      "outputDirectory": {
        "value": "build"
      }
    },
    "engine": "ruby"
  },
  {
    "name": "Zola",
    "slug": "zola",
    "tagline": "Everything you need to make a static site engine in one binary.",
    "description": "A Zola app, created with the \"Getting Started\" tutorial.",
    "detectors": {
      "every": [
        {
          "path": "config.toml",
          "matchContent": "base_url"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "None"
      },
      "buildCommand": {
        "value": "zola build"
      },
      "devCommand": {
        "placeholder": "zola serve",
        "value": "zola serve --port $PORT"
      },
      "outputDirectory": {
        "value": "public"
      }
    },
    "engine": "rust"
  },
  {
    "name": "Hydrogen (v1)",
    "slug": "hydrogen",
    "tagline": "React framework for headless commerce",
    "description": "React framework for headless commerce",
    "envPrefix": "PUBLIC_",
    "supersedes": [
      "vite"
    ],
    "detectors": {
      "some": [
        {
          "matchPackage": "@shopify/hydrogen"
        },
        {
          "path": "hydrogen.config.js"
        },
        {
          "path": "hydrogen.config.ts"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "value": "shopify hydrogen build",
        "placeholder": "`npm run build` or `shopify hydrogen build`"
      },
      "devCommand": {
        "value": "shopify hydrogen dev",
        "placeholder": "shopify hydrogen dev"
      },
      "outputDirectory": {
        "value": "dist"
      }
    },
    "engine": "node"
  },
  {
    "name": "Vite",
    "slug": "vite",
    "tagline": "Vite is a new breed of frontend build tool that significantly improves the frontend development experience.",
    "description": "A Vue.js app, created with Vite.",
    "envPrefix": "VITE_",
    "supersedes": [
      "ionic-react"
    ],
    "detectors": {
      "every": [
        {
          "matchPackage": "vite"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `vite build`",
        "value": "vite build"
      },
      "devCommand": {
        "placeholder": "vite",
        "value": "vite --port $PORT"
      },
      "outputDirectory": {
        "value": "dist"
      }
    },
    "engine": "node"
  },
  {
    "name": "TanStack Start",
    "slug": "tanstack-start",
    "tagline": "Full-stack Framework powered by TanStack Router for React and Solid.",
    "description": "Full-document SSR, Streaming, Server Functions, bundling and more, powered by TanStack Router and Vite - Ready to deploy to your favorite hosting provider.",
    "supersedes": [
      "ionic-react",
      "vite"
    ],
    "detectors": {
      "every": [
        {
          "matchPackage": "@tanstack/router-plugin"
        }
      ],
      "some": [
        {
          "matchPackage": "@tanstack/react-start"
        },
        {
          "matchPackage": "@tanstack/solid-start"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `vite build`",
        "value": "vite build"
      },
      "devCommand": {
        "placeholder": "vite",
        "value": "vite --port $PORT"
      },
      "outputDirectory": {
        "value": "dist"
      }
    },
    "engine": "node"
  },
  {
    "name": "VitePress",
    "slug": "vitepress",
    "tagline": "VitePress is VuePress' little brother, built on top of Vite.",
    "description": "VuePress on top of Vite",
    "detectors": {
      "every": [
        {
          "matchPackage": "vitepress"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `vitepress build docs`",
        "value": "vitepress build docs"
      },
      "devCommand": {
        "value": "vitepress dev docs --port $PORT"
      },
      "outputDirectory": {
        "value": "docs/.vitepress/dist"
      }
    },
    "engine": "node"
  },
  {
    "name": "VuePress",
    "slug": "vuepress",
    "tagline": "Vue-powered Static Site Generator",
    "description": "Vue-powered Static Site Generator",
    "detectors": {
      "every": [
        {
          "matchPackage": "vuepress"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `vuepress build src`",
        "value": "vuepress build src"
      },
      "devCommand": {
        "value": "vuepress dev src --port $PORT"
      },
      "outputDirectory": {
        "value": "src/.vuepress/dist"
      }
    },
    "engine": "node"
  },
  {
    "name": "Parcel",
    "slug": "parcel",
    "tagline": "Parcel is a zero configuration build tool for the web that scales to projects of any size and complexity.",
    "description": "A vanilla web app built with Parcel.",
    "detectors": {
      "every": [
        {
          "matchPackage": "parcel"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `parcel build`",
        "value": "parcel build"
      },
      "devCommand": {
        "placeholder": "parcel",
        "value": "parcel"
      },
      "outputDirectory": {
        "value": "dist"
      }
    },
    "engine": "node"
  },
  {
    "name": "FastAPI",
    "slug": "fastapi",
    "tagline": "FastAPI framework, high performance, easy to learn, fast to code, ready for production",
    "description": "FastAPI framework, high performance, easy to learn, fast to code, ready for production",
    "supersedes": [
      "python"
    ],
    "detectors": {
      "some": [
        {
          "path": "requirements.txt",
          "matchContent": "fastapi"
        },
        {
          "path": "pyproject.toml",
          "matchContent": "fastapi"
        },
        {
          "path": "Pipfile",
          "matchContent": "fastapi"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`pip install -r requirements.txt`"
      },
      "buildCommand": {
        "placeholder": "None",
        "value": null
      },
      "devCommand": {
        "placeholder": "None",
        "value": null
      },
      "outputDirectory": {
        "value": "N/A"
      }
    },
    "engine": "python"
  },
  {
    "name": "Flask",
    "slug": "flask",
    "tagline": "The Python micro web framework",
    "description": "A Flask app, ready for production",
    "supersedes": [
      "python"
    ],
    "detectors": {
      "some": [
        {
          "path": "requirements.txt",
          "matchContent": "[Ff]lask"
        },
        {
          "path": "pyproject.toml",
          "matchContent": "[Ff]lask"
        },
        {
          "path": "Pipfile",
          "matchContent": "[Ff]lask"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`pip install -r requirements.txt`"
      },
      "buildCommand": {
        "placeholder": "None",
        "value": null
      },
      "devCommand": {
        "placeholder": "None",
        "value": null
      },
      "outputDirectory": {
        "value": "N/A"
      }
    },
    "engine": "python"
  },
  {
    "name": "FastHTML",
    "slug": "fasthtml",
    "tagline": "The fastest way to create an HTML app",
    "description": "A library for writing fast and scalable Starlette-powered web applications",
    "supersedes": [
      "python"
    ],
    "detectors": {
      "every": [
        {
          "path": "requirements.txt",
          "matchContent": "python-fasthtml"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`pip install`"
      },
      "buildCommand": {
        "placeholder": "None",
        "value": null
      },
      "devCommand": {
        "value": "uvicorn main:app --reload"
      },
      "outputDirectory": {
        "value": "N/A"
      }
    },
    "engine": "python"
  },
  {
    "name": "Django",
    "slug": "django",
    "tagline": "Django is a high-level Python web framework that encourages rapid development and clean, pragmatic design.",
    "description": "A Django project served via the Python Runtime.",
    "supersedes": [
      "python"
    ],
    "detectors": {
      "some": [
        {
          "path": "requirements.txt",
          "matchContent": "[Dd]jango"
        },
        {
          "path": "pyproject.toml",
          "matchContent": "[Dd]jango"
        },
        {
          "path": "Pipfile",
          "matchContent": "[Dd]jango"
        },
        {
          "path": "manage.py",
          "matchContent": "DJANGO_SETTINGS_MODULE"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`pip install -r requirements.txt`"
      },
      "buildCommand": {
        "placeholder": "None",
        "value": null
      },
      "devCommand": {
        "placeholder": "None",
        "value": null
      },
      "outputDirectory": {
        "value": "N/A"
      }
    },
    "engine": "python"
  },
  {
    "name": "Ash",
    "slug": "ash",
    "tagline": "A filesystem-first framework for.",
    "description": "An Ash app: agents authored as a directory of files.",
    "experimental": true,
    "detectors": {
      "every": [
        {
          "path": "package.json",
          "matchContent": "\"(dev)?(d|D)ependencies\":\\s*{[^}]*\"experimental-ash\":\\s*\".+?\"[^}]*}"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`pnpm install`, `yarn install`, or `npm install`"
      },
      "buildCommand": {
        "value": "ash build",
        "placeholder": "`npm run build` or `ash build`"
      },
      "devCommand": {
        "value": "ash dev",
        "placeholder": "ash dev"
      },
      "outputDirectory": {
        "value": ".output"
      }
    },
    "engine": "node"
  },
  {
    "name": "eve",
    "slug": "eve",
    "tagline": "A filesystem-first framework for.",
    "description": "An eve app: agents authored as a directory of files.",
    "detectors": {
      "every": [
        {
          "path": "package.json",
          "matchContent": "\"(dev)?(d|D)ependencies\":\\s*{[^}]*\"eve\":\\s*\".+?\"[^}]*}"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`pnpm install`, `yarn install`, or `npm install`"
      },
      "buildCommand": {
        "value": "eve build",
        "placeholder": "`npm run build` or `eve build`"
      },
      "devCommand": {
        "value": "eve dev",
        "placeholder": "eve dev"
      },
      "outputDirectory": {
        "value": ".output"
      }
    },
    "engine": "node"
  },
  {
    "name": "Sanity",
    "slug": "sanity",
    "tagline": "The back-end built for AI content operations. Power web, mobile, and agentic applications at scale.",
    "description": "A Sanity Studio",
    "envPrefix": "SANITY_STUDIO_",
    "detectors": {
      "some": [
        {
          "path": "sanity.config.js"
        },
        {
          "path": "sanity.config.jsx"
        },
        {
          "path": "sanity.config.ts"
        },
        {
          "path": "sanity.config.tsx"
        }
      ],
      "every": [
        {
          "matchPackage": "sanity"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `sanity build`",
        "value": "sanity build"
      },
      "devCommand": {
        "value": "sanity dev --port $PORT"
      },
      "outputDirectory": {
        "value": "dist"
      }
    },
    "engine": "node"
  },
  {
    "name": "Sanity (v2 - legacy)",
    "slug": "sanity-v2",
    "tagline": "The structured content platform.",
    "description": "A Sanity Studio",
    "envPrefix": "SANITY_STUDIO_",
    "detectors": {
      "some": [
        {
          "path": "sanity.json"
        }
      ],
      "every": [
        {
          "path": "package.json",
          "matchContent": "\"(dev)?(d|D)ependencies\":\\s*{[^}]*\"@sanity/cli\":\\s*\"\\^?2\\..*\"[^}]*}"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `sanity build`",
        "value": "sanity build"
      },
      "devCommand": {
        "value": "sanity start --port $PORT"
      },
      "outputDirectory": {
        "value": "dist"
      }
    },
    "engine": "node"
  },
  {
    "name": "Storybook",
    "slug": "storybook",
    "tagline": "Frontend workshop for UI development",
    "description": "Storybook is a frontend workshop for building UI components and pages in isolation.",
    "detectors": {
      "every": [
        {
          "matchPackage": "storybook"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "value": "storybook build",
        "ignorePackageJsonScript": true
      },
      "devCommand": {
        "value": "storybook dev -p $PORT"
      },
      "outputDirectory": {
        "value": "storybook-static"
      }
    },
    "engine": "node"
  },
  {
    "name": "Nitro",
    "slug": "nitro",
    "tagline": "Nitro is a next generation server toolkit.",
    "description": "Nitro lets you create web servers that run on multiple platforms.",
    "supersedes": [
      "vite"
    ],
    "detectors": {
      "some": [
        {
          "matchPackage": "nitropack"
        },
        {
          "matchPackage": "nitro"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `nitro build`",
        "value": "nitro build"
      },
      "devCommand": {
        "value": "nitro dev"
      },
      "outputDirectory": {
        "value": "dist"
      }
    },
    "engine": "node"
  },
  {
    "name": "Hono",
    "slug": "hono",
    "tagline": "Web framework built on Web Standards",
    "description": "Fast, lightweight, built on Web Standards. Support for any JavaScript runtime.",
    "supersedes": [
      "node"
    ],
    "detectors": {
      "every": [
        {
          "matchPackage": "hono"
        }
      ],
      "some": [
        {
          "path": "app.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']hono[\"']\\s*(?:\\))?"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "None",
        "value": null
      },
      "devCommand": {
        "placeholder": "None",
        "value": null
      },
      "outputDirectory": {
        "value": "N/A"
      }
    },
    "engine": "node"
  },
  {
    "name": "Express",
    "slug": "express",
    "tagline": "Fast, unopinionated, minimalist web framework for Node.js",
    "description": "Fast, unopinionated, minimalist web framework for Node.js",
    "supersedes": [
      "node"
    ],
    "detectors": {
      "every": [
        {
          "matchPackage": "express"
        }
      ],
      "some": [
        {
          "path": "app.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']express[\"']\\s*(?:\\))?"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "None",
        "value": null
      },
      "devCommand": {
        "placeholder": "None",
        "value": null
      },
      "outputDirectory": {
        "value": "N/A"
      }
    },
    "engine": "node"
  },
  {
    "name": "H3",
    "slug": "h3",
    "tagline": "Universal, Tiny, and Fast Servers",
    "description": "H(TTP) server framework built on top of web standards for high performance and composability.",
    "supersedes": [
      "node"
    ],
    "detectors": {
      "every": [
        {
          "matchPackage": "h3"
        }
      ],
      "some": [
        {
          "path": "app.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']h3[\"']\\s*(?:\\))?"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "None",
        "value": null
      },
      "devCommand": {
        "placeholder": "None",
        "value": null
      },
      "outputDirectory": {
        "value": "N/A"
      }
    },
    "engine": "node"
  },
  {
    "name": "Koa",
    "slug": "koa",
    "tagline": "Expressive middleware for Node.js using ES2017 async functions",
    "description": "Koa is a new web framework designed by the team behind Express, which aims to be a smaller, more expressive, and more robust foundation for web applications and APIs.",
    "supersedes": [
      "node"
    ],
    "detectors": {
      "every": [
        {
          "matchPackage": "koa"
        }
      ],
      "some": [
        {
          "path": "app.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']koa[\"']\\s*(?:\\))?"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "None",
        "value": null
      },
      "devCommand": {
        "placeholder": "None",
        "value": null
      },
      "outputDirectory": {
        "value": "N/A"
      }
    },
    "engine": "node"
  },
  {
    "name": "NestJS",
    "slug": "nestjs",
    "tagline": "Framework for building efficient, scalable Node.js server-side applications",
    "description": "A progressive Node.js framework for building efficient, reliable and scalable server-side applications.",
    "supersedes": [
      "node"
    ],
    "detectors": {
      "every": [
        {
          "matchPackage": "@nestjs/core"
        }
      ],
      "some": [
        {
          "path": "src/main.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/main.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/main.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/main.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/main.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/main.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "main.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "main.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "main.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "main.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "main.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "main.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']@nestjs/core[\"']\\s*(?:\\))?"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "None",
        "value": null
      },
      "devCommand": {
        "placeholder": "None",
        "value": null
      },
      "outputDirectory": {
        "value": "N/A"
      }
    },
    "engine": "node"
  },
  {
    "name": "Elysia",
    "slug": "elysia",
    "tagline": "Ergonomic framework for humans",
    "description": "TypeScript with End-to-End Type Safety, type integrity, and exceptional developer experience. Supercharged by Bun.",
    "supersedes": [
      "node"
    ],
    "detectors": {
      "every": [
        {
          "matchPackage": "elysia"
        }
      ],
      "some": [
        {
          "path": "app.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']elysia[\"']\\s*(?:\\))?"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "None",
        "value": null
      },
      "devCommand": {
        "placeholder": "None",
        "value": null
      },
      "outputDirectory": {
        "value": "N/A"
      }
    },
    "engine": "node"
  },
  {
    "name": "Fastify",
    "slug": "fastify",
    "tagline": "Fast and low overhead web framework, for Node.js",
    "description": "Fastify is a web framework highly focused on providing the best developer experience with the least overhead and a powerful plugin architecture.",
    "supersedes": [
      "node"
    ],
    "detectors": {
      "every": [
        {
          "matchPackage": "fastify"
        }
      ],
      "some": [
        {
          "path": "app.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "app.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "index.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "server.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/index.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/app.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.cjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.js",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.mjs",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.mts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.ts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        },
        {
          "path": "src/server.cts",
          "matchContent": "(?:from|require|import)\\s*(?:\\(\\s*)?[\"']fastify[\"']\\s*(?:\\))?"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "None",
        "value": null
      },
      "devCommand": {
        "placeholder": "None",
        "value": null
      },
      "outputDirectory": {
        "value": "N/A"
      }
    },
    "engine": "node"
  },
  {
    "name": "xmcp",
    "slug": "xmcp",
    "tagline": "The MCP framework for building AI-powered tools",
    "description": "A framework for building Model Context Protocol servers with zero configuration.",
    "detectors": {
      "some": [
        {
          "path": "xmcp.config.ts"
        },
        {
          "path": "xmcp.config.js"
        },
        {
          "matchPackage": "xmcp"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `xmcp build`",
        "value": "xmcp build --vercel"
      },
      "devCommand": {
        "value": "xmcp dev",
        "placeholder": "xmcp dev"
      },
      "outputDirectory": {
        "value": "dist"
      }
    },
    "engine": "node"
  },
  {
    "name": "Python",
    "slug": "python",
    "tagline": "Python is a programming language that lets you work quickly and integrate systems more effectively.",
    "description": "A generic Python application deployed as a serverless function.",
    "runtimeFramework": true,
    "detectors": {
      "some": [
        {
          "path": "requirements.txt"
        },
        {
          "path": "pyproject.toml"
        },
        {
          "path": "Pipfile"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`pip install -r requirements.txt`"
      },
      "buildCommand": {
        "placeholder": "None",
        "value": null
      },
      "devCommand": {
        "placeholder": "None",
        "value": null
      },
      "outputDirectory": {
        "value": "N/A"
      }
    },
    "engine": "python"
  },
  {
    "name": "Ruby",
    "slug": "ruby",
    "tagline": "A dynamic, open source programming language with a focus on simplicity and productivity.",
    "description": "A generic Ruby application deployed as a serverless function.",
    "experimental": true,
    "runtimeFramework": true,
    "detectors": {
      "every": [
        {
          "path": "config.ru"
        },
        {
          "path": "Gemfile"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`bundle install`"
      },
      "buildCommand": {
        "placeholder": "None",
        "value": null
      },
      "devCommand": {
        "placeholder": "None",
        "value": null
      },
      "outputDirectory": {
        "value": "N/A"
      }
    },
    "engine": "ruby"
  },
  {
    "name": "Rust",
    "slug": "rust",
    "tagline": "A language empowering everyone to build reliable and efficient software.",
    "description": "A generic Rust application deployed as a serverless function.",
    "experimental": true,
    "runtimeFramework": true,
    "detectors": {
      "every": [
        {
          "path": "Cargo.toml"
        },
        {
          "path": "src/main.rs"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "None"
      },
      "buildCommand": {
        "placeholder": "None",
        "value": null
      },
      "devCommand": {
        "placeholder": "`cargo run`",
        "value": null
      },
      "outputDirectory": {
        "value": "N/A"
      }
    },
    "engine": "rust"
  },
  {
    "name": "Axum",
    "slug": "axum",
    "tagline": "Ergonomic and modular web framework built with Tokio, Tower, and Hyper.",
    "description": "An Axum application deployed as a serverless function.",
    "experimental": true,
    "supersedes": [
      "rust"
    ],
    "detectors": {
      "every": [
        {
          "path": "Cargo.toml",
          "matchContent": "axum\\s*="
        },
        {
          "path": "src/main.rs"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "None"
      },
      "buildCommand": {
        "placeholder": "None",
        "value": null
      },
      "devCommand": {
        "placeholder": "`cargo run`",
        "value": null
      },
      "outputDirectory": {
        "value": "N/A"
      }
    },
    "engine": "rust"
  },
  {
    "name": "Actix Web",
    "slug": "actix-web",
    "tagline": "A powerful, pragmatic, and extremely fast web framework for Rust.",
    "description": "An Actix Web application deployed as a serverless function.",
    "experimental": true,
    "runtimeFramework": true,
    "supersedes": [
      "rust"
    ],
    "detectors": {
      "every": [
        {
          "path": "Cargo.toml",
          "matchContent": "actix-web\\s*="
        },
        {
          "path": "src/main.rs"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "None"
      },
      "buildCommand": {
        "placeholder": "None",
        "value": null
      },
      "devCommand": {
        "placeholder": "`cargo run`",
        "value": null
      },
      "outputDirectory": {
        "value": "N/A"
      }
    },
    "engine": "rust"
  },
  {
    "name": "Bun",
    "slug": "bun",
    "tagline": "Bun is a fast all-in-one JavaScript runtime, bundler, and package manager.",
    "description": "A Bun application deployed as a serverless function.",
    "experimental": true,
    "runtimeFramework": true,
    "supersedes": [
      "node"
    ],
    "detectors": {
      "every": [
        {
          "path": "bun.lock"
        }
      ],
      "some": [
        {
          "path": "server.cjs"
        },
        {
          "path": "server.js"
        },
        {
          "path": "server.mjs"
        },
        {
          "path": "server.mts"
        },
        {
          "path": "server.ts"
        },
        {
          "path": "server.cts"
        },
        {
          "path": "src/server.cjs"
        },
        {
          "path": "src/server.js"
        },
        {
          "path": "src/server.mjs"
        },
        {
          "path": "src/server.mts"
        },
        {
          "path": "src/server.ts"
        },
        {
          "path": "src/server.cts"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "value": "bun install",
        "placeholder": "bun install"
      },
      "buildCommand": {
        "placeholder": "None",
        "value": null
      },
      "devCommand": {
        "placeholder": "`bun dev`, `bun run dev`, or `bun --hot server.ts`",
        "value": null
      },
      "outputDirectory": {
        "value": "N/A"
      }
    },
    "engine": "node"
  },
  {
    "name": "Node",
    "slug": "node",
    "tagline": "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine.",
    "description": "A generic Node.js application deployed as a serverless function.",
    "runtimeFramework": true,
    "detectors": {
      "some": [
        {
          "path": "server.cjs"
        },
        {
          "path": "server.js"
        },
        {
          "path": "server.mjs"
        },
        {
          "path": "server.mts"
        },
        {
          "path": "server.ts"
        },
        {
          "path": "server.cts"
        },
        {
          "path": "src/server.cjs"
        },
        {
          "path": "src/server.js"
        },
        {
          "path": "src/server.mjs"
        },
        {
          "path": "src/server.mts"
        },
        {
          "path": "src/server.ts"
        },
        {
          "path": "src/server.cts"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "None",
        "value": null
      },
      "devCommand": {
        "placeholder": "`npm run dev`, `node server.js`, or `npx ts-node server.ts`",
        "value": null
      },
      "outputDirectory": {
        "value": "N/A"
      }
    },
    "engine": "node"
  },
  {
    "name": "Go",
    "slug": "go",
    "tagline": "An open-source programming language supported by Google.",
    "description": "A generic Go application deployed as a serverless function.",
    "runtimeFramework": true,
    "detectors": {
      "every": [
        {
          "path": "go.mod"
        }
      ],
      "some": [
        {
          "path": "main.go"
        },
        {
          "path": "cmd/api/main.go"
        },
        {
          "path": "cmd/server/main.go"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`go mod download`"
      },
      "buildCommand": {
        "placeholder": "None",
        "value": null
      },
      "devCommand": {
        "placeholder": "`go run .` or `go run ./cmd/api`",
        "value": null
      },
      "outputDirectory": {
        "value": "N/A"
      }
    },
    "engine": "go"
  },
  {
    "name": "Services",
    "slug": "services",
    "tagline": "Multiple services deployed as serverless functions within your project.",
    "description": "Multiple services deployed as serverless functions within your project.",
    "experimental": true,
    "settings": {
      "installCommand": {
        "placeholder": "None"
      },
      "buildCommand": {
        "placeholder": "None",
        "value": null
      },
      "devCommand": {
        "placeholder": "None",
        "value": null
      },
      "outputDirectory": {
        "value": "N/A"
      }
    },
    "engine": "node"
  },
  {
    "name": "Mastra",
    "slug": "mastra",
    "tagline": "Build AI agents with a modern TypeScript stack",
    "description": "Mastra is a framework for building AI-powered apps and agents with workflows, memory, streaming, evals, tracing, and Studio, an interactive UI for dev and testing.",
    "detectors": {
      "every": [
        {
          "matchPackage": "mastra"
        }
      ]
    },
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build` or `mastra build`",
        "value": "mastra build"
      },
      "devCommand": {
        "value": "mastra dev"
      },
      "outputDirectory": {
        "value": ".mastra"
      }
    },
    "engine": "node"
  },
  {
    "name": "Other",
    "slug": null,
    "description": "No framework or an unoptimized framework.",
    "settings": {
      "installCommand": {
        "placeholder": "`yarn install`, `pnpm install`, `npm install`, or `bun install`"
      },
      "buildCommand": {
        "placeholder": "`npm run build`",
        "value": null
      },
      "devCommand": {
        "placeholder": "None",
        "value": null
      },
      "outputDirectory": {
        "placeholder": "`public` if it exists, or `.`"
      }
    }
  }
] as const
