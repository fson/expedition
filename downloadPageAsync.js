import { FileSystem } from 'expo';
import { btoa } from 'Base64';

export default async function downloadPageAsync(url, directoryUrl) {
  const fileUrl = directoryUrl + btoa(url) + '.html';
  // const response = await fetch(url);
  // const source = await response.text();
  // await FileSystem.writeAsStringAsync(fileUrl, html);
  await FileSystem.downloadAsync(url, fileUrl);
}
