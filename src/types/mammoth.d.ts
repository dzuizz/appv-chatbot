declare module 'mammoth' {
  interface ExtractRawTextResult {
    value: string;
    messages: unknown[];
  }

  interface ExtractRawTextOptions {
    buffer: Buffer;
  }

  const mammoth: {
    extractRawText(options: ExtractRawTextOptions): Promise<ExtractRawTextResult>;
  };

  export = mammoth;
}