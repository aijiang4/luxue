export async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const buffers = [];

  for await (const data of stream) {
    buffers.push(data);
  }

  return Buffer.concat(buffers);
}

export async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
  return (await streamToBuffer(stream)).toString();
}
