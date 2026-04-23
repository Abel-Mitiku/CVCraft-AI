import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const exportResumeToPDF = async (
  elementId: string,
  fileName: string = "resume.pdf",
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element "${elementId}" not found`);

  console.log(`📄 Exporting "${elementId}" to "${fileName}"`);

  const originalElementStyle = element.style.cssText;
  const hiddenParents: {
    el: HTMLElement;
    display: string;
    visibility: string;
  }[] = [];

  let parent = element.parentElement;
  while (parent && parent !== document.body) {
    const computed = window.getComputedStyle(parent);
    if (computed.display === "none" || computed.visibility === "hidden") {
      hiddenParents.push({
        el: parent,
        display: parent.style.display,
        visibility: parent.style.visibility,
      });
      parent.style.display = "block";
      parent.style.visibility = "visible";
    }
    parent = parent.parentElement;
  }

  element.style.position = "fixed";
  element.style.left = "0";
  element.style.top = "0";
  element.style.width = "210mm";
  element.style.minHeight = "297mm";
  element.style.transform = "scale(1)";
  element.style.display = "block";
  element.style.visibility = "visible";
  element.style.zIndex = "99999";
  element.style.backgroundColor = "#ffffff";
  element.style.overflow = "visible";

  try {
    await document.fonts.ready;
    await new Promise((resolve) => setTimeout(resolve, 400));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",

      onclone: (clonedDoc) => {
        clonedDoc
          .querySelectorAll(
            "button, select, input, .no-print, .scale-controls, [title]",
          )
          .forEach((el) => {
            (el as HTMLElement).style.display = "none";
          });

        const emailEl = clonedDoc.querySelector(
          ".contact-email",
        ) as HTMLElement;
        if (emailEl) {
          emailEl.style.marginTop = "3px";
        }

        clonedDoc.querySelectorAll("*").forEach((el) => {
          if (el instanceof HTMLElement) {
            const style = el.style;
            style.backgroundColor = style.backgroundColor.replace(
              /(lab|lch|oklab|oklch|color)\([^)]+\)/gi,
              "#ffffff",
            );
            style.color = style.color.replace(
              /(lab|lch|oklab|oklch|color)\([^)]+\)/gi,
              "#000000",
            );
            style.borderColor = style.borderColor.replace(
              /(lab|lch|oklab|oklch|color)\([^)]+\)/gi,
              "#e5e7eb",
            );
          }
        });
      },
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const ratio = Math.min(210 / canvas.width, 297 / canvas.height);
    pdf.addImage(
      imgData,
      "PNG",
      0,
      0,
      canvas.width * ratio,
      canvas.height * ratio,
      undefined,
      "FAST",
    );

    pdf.save(fileName);
    console.log("✅ PDF exported successfully");
  } catch (error: any) {
    console.error("❌ PDF export failed:", error?.message || error);
    throw error;
  } finally {
    element.style.cssText = originalElementStyle;
    hiddenParents.forEach(({ el, display, visibility }) => {
      el.style.display = display;
      el.style.visibility = visibility;
    });
  }
};
