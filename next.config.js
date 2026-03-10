/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // يبقى مفيداً للصور
  },
  trailingSlash: true,
  // تم إزالة output: 'export' حتى تعمل API routes
}

module.exports = nextConfig