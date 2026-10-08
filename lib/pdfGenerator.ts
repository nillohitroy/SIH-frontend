import { jsPDF } from "jspdf";

export const downloadEvidencePDF = async (
  taskType: string, 
  prompt: string, 
  answer: string, 
  images: { primary?: string; before?: string; after?: string }
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title & Header
  doc.setFontSize(16);
  doc.text("SatQuery AI - Vision Analysis Report", 14, 20);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Prompt / Query:", 14, 35);
  doc.setFont("helvetica", "normal");
  const splitPrompt = doc.splitTextToSize(prompt, pageWidth - 28);
  doc.text(splitPrompt, 14, 42);

  let currentY = 42 + (splitPrompt.length * 6) + 10;

  // Answer / Output
  doc.setFont("helvetica", "bold");
  doc.text("Agentic Output:", 14, currentY);
  doc.setFont("helvetica", "normal");
  const splitAnswer = doc.splitTextToSize(answer, pageWidth - 28);
  doc.text(splitAnswer, 14, currentY + 7);
  
  currentY = currentY + 7 + (splitAnswer.length * 6) + 15;

  const addImageToPdf = (imgUrl: string, x: number, y: number, width: number, height: number, label?: string): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imgUrl;
      img.onload = () => {
        if (label) {
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text(label, x, y - 3);
        }
        doc.addImage(img, 'JPEG', x, y, width, height);
        resolve();
      };
      img.onerror = () => resolve();
    });
  };

  const imgWidth = 80;
  const imgHeight = 60;

  if ((taskType === 'change_detection' || taskType === 'change_vqa' || taskType === 'optical_sar') && images.before && images.after) {
    await addImageToPdf(images.before, 14, currentY, imgWidth, imgHeight, "Before Image:");
    await addImageToPdf(images.after, 100, currentY, imgWidth, imgHeight, "After Image (Changes Highlighted):");
  } else if (images.primary) {
    await addImageToPdf(images.primary, 14, currentY, 120, 90, "Evidence Grounding Image:");
  }

  doc.save("satquery-analysis-report.pdf");
};