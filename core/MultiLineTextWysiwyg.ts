// Copyright (c) 2023 TXPCo Ltd

/**
 * Calculate how many lines a piece of text will span when wrapped
 * @param context - canvas 2d context. If this is null (e.g. not supported on Browser, will estimate assuming fixed font width )
 * @param text - the text to measure
 * @param x - X start of the layout area
 * @param y - Y start of the layout area
 * @param maxWidth - width of the layout area
 * @param lineHeight - height of one line (from fontMetrics) 
 * @param spaceCharWidth - width of a space character to use as fallback for downlevel browsers
 * @param drawText - boolean - if true, the text is drawn in place, else its just measured
 * @returns - the number of pixels needed in Y direction top to bottom 
 */
// http://www.html5canvastutorials.com/tutorials/html5-canvas-wrap-text-tutorial/

export function wrapText(context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D, text: string,
   x: number, y: number, maxWidth: number, lineHeight: number, spaceCharWidth: number,
   drawText: boolean): number {

   var hardLines = text.split("\n");

   // Special case if we dont have any text - allow provision for one line
   if (hardLines.length === 0)
      return lineHeight;

   if (context)
      spaceCharWidth = context.measureText(" ").width;

   var dy = 0;

   for (var ii = 0; ii < hardLines.length; ii++) {

      var line = "";
      var words = hardLines[ii].split(" ");
      var lineWidth = 0;

      for (var n = 0; n < words.length; n++) {
         var testLine = line + words[n] + " ";
         var testWidth;

         if (context)
            testWidth = context.measureText(testLine).width;
         else
            testWidth = spaceCharWidth * testLine.length;

         // Print the txt if we have incrementally exceeded maxWidth, 
         // or if we only have one word so we have to any way. 
         if ((testWidth > maxWidth) || ((testWidth > maxWidth) && n === 0)) {
            if (drawText && context)
               context.fillText(line, x + (maxWidth - lineWidth) / 2, y);
            line = words[n] + " ";
            y += lineHeight;
            dy += lineHeight;
            lineWidth = (testWidth - lineWidth) - spaceCharWidth / 2;
         }
         else {
            line = testLine;
            lineWidth = testWidth - spaceCharWidth / 2;
         }
      }

      if (context)
         testWidth = context.measureText(line).width;
      else
         testWidth = spaceCharWidth * line.length;

      if (drawText && context)
         context.fillText(line, x + (maxWidth + spaceCharWidth - testWidth) / 2, y);
      y += lineHeight;
      dy += lineHeight;
   }

   return dy;
}

// Ref
// https://blog.steveasleep.com/how-to-draw-multi-line-text-on-an-html-canvas-in-2021

function findLeafNodeStyle(ancestor: Element): CSSStyleDeclaration {
   let nextAncestor = ancestor;
   while (nextAncestor.children.length) {
      nextAncestor = nextAncestor.children[0];
   }
   return window.getComputedStyle(nextAncestor, null);
}

export class FontMetrics {
   font: string;
   lineHeight: number;
}

export function fontMetrics(element: HTMLElement): FontMetrics {

   const style = findLeafNodeStyle(element);

   var lineHeight = parseFloat(style.getPropertyValue("line-height"));

   /*
   var font = style.getPropertyValue("font");

   var fontStyle = style.getPropertyValue("font-style");
   var fontVariant = style.getPropertyValue("font-variant");
   var fontWeight = style.getPropertyValue("font-weight");
   */

   var fontFamily = (style.getPropertyValue("font-family")).split(",", 1)[0].replaceAll('"', '');;
   var fontSize = parseFloat(style.getPropertyValue("font-size"));

   return ({
      font: fontSize + 'px ' + fontFamily,
      lineHeight: lineHeight
   });
}   