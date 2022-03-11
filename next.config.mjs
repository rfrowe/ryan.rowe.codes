import {defaultConfig} from "next/dist/server/config-shared.js";
import withMdx from '@next/mdx'
import MdxConfig from "./mdx.config.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: [...defaultConfig.pageExtensions, 'md', 'mdx'],
  reactStrictMode: true,
}

export default withMdx(MdxConfig)(nextConfig)
