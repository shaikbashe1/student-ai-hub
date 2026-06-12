import React from "react";

interface JsonLdProps {
  schema: Record<string, any>;
  id?: string;
}

export default function JsonLd({ schema, id = "jsonld-seo" }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      id={id}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
    />
  );
}
