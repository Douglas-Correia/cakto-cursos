export function downloadFile ({ url, filename }: { url: string, filename: string}) {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
    link.parentNode.removeChild(link);
  }
  