"use client";

import React from "react";
import Page3DShell from "@/app/components/CyberBackground/Page3DShell";

export default function CoursesPage() {
  return (
    <Page3DShell variant="grid">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1rem", textAlign: "center" }}>
        <h1 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "2.5rem", color: "var(--couleur-cinquieme)", marginBottom: "1rem" }}>
          Courses
        </h1>
        <p style={{ color: "var(--couleur-tertiaire)", fontFamily: "Abel, sans-serif" }}>
          These are the courses.
        </p>
      </div>
    </Page3DShell>
  );
}
