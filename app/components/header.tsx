"use client";
import Image from "next/image";

export function Header() {
  return (
    <div className="w-full flex flex-col items-center">
      <Image
        src={`/assets/logo.jpg`}
        width={400}
        height={300}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        alt="CvCraft-ai-logo"
      />
      <div className="w-[500px] text-center">
        <p>
          Create professional, ATS-Friendly resumes with AI-Powered content
          generation and industry-specific optimization
        </p>
      </div>
    </div>
  );
}
