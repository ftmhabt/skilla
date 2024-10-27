export default function isJson(str: string) {
  try {
    JSON.parse(str);
  } catch (e) {
    if (e instanceof Error) {
      console.log("something");
    }
    return false;
  }
  return true;
}
