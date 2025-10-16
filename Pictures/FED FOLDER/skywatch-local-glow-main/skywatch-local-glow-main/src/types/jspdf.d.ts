declare module 'jspdf' {
  // Keep typings minimal and safe for dynamic import usage in the app
  const jsPDF: unknown;
  export default jsPDF;
  export { jsPDF };
}
