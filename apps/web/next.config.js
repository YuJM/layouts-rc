/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  //build시 console.log 메시지 출력 안함
  eslint: {
    ignoreDuringBuilds: true,
  },
};
