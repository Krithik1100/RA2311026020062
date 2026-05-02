/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/notifications",
        destination: "http://20.207.122.201/evaluation-service/notifications"
      }
    ];
  }
};

export default nextConfig;
