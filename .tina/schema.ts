import {defineSchema, defineConfig} from "tinacms";

export default defineSchema({
  collections: [
    {
      label: "Blog Posts",
      name: "post",
      path: "content/blog",
      fields: [
        {
          type: "string",
          label: "Title",
          name: "title",
          required: true,
        },
        {
          type: "string",
          label: "Slug",
          name: "slug",
          required: true,
        },
        {
          type: "datetime",
          label: "Created At",
          name: "created_at",
          required: true,
        },
        {
          type: "string",
          label: "Headline",
          name: "headline",
        },
        {
          type: "string",
          label: "Blog Post Body",
          name: "body",
          isBody: true,
          required: true,
          ui: {
            component: "markdown"
          },
        },
      ],
    },
  ],
});




// Your tina config
// ==============
const branch = 'main'
// When working locally, hit our local filesystem.
// On a Vercel deployment, hit the Tina Cloud API
const apiURL =
  process.env.NODE_ENV == 'development'
    ? 'http://localhost:4001/graphql'
    : `https://content.tinajs.io/content/${process.env.NEXT_PUBLIC_TINA_CLIENT_ID}/github/${branch}`

export const tinaConfig = defineConfig({
  apiURL,
});
