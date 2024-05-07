/*! Copyright TXPCo 2022//

/* 
// React
import React from 'react';

// Fluent
import { makeStyles, tokens, Textarea, TextareaProps, TextareaOnChangeData } from '@fluentui/react-components';

const textFieldId = "canvasTextArea";

// fudge factors that seem to work visually
const borderTop = 1;
const borderBottom = 2;

const outerStyles = makeStyles({
   root: {
      display: 'flex',
      flexDirection: 'column',
      position: 'absolute'
   },
});

const textColumnStyles = makeStyles({
   root: {
      display: 'flex',
      flexDirection: 'column',
      "& > label": {
         display: "block",
         marginBottom: tokens.spacingVerticalMNudge,
      },
      marginLeft: '0',
      marginRight: '0',
      marginTop: '0',
      marginBottom: '0',
      paddingLeft: '0',
      paddingRight: '0',
      paddingTop: '0',
      paddingBottom: '0',
      width: '100%',
      verticalAlign: 'middle'
   },
   textarea: {
      height: '100%',
      marginLeft: '0',
      marginRight: '0',
      marginTop: '0',
      marginBottom: '0',
      paddingLeft: '0',
      paddingRight: '0',
      paddingTop: '0',
      paddingBottom: '0',
      textAlign: 'center',
      verticalAlign: 'middle',
      fontFamily: 'Short Stack, cursive',
      fontSize: '18pt'
   },
   prompt: {
      fontFamily: 'Open Sans, sans serif',
      textAlign: 'center',
      fontSize: '8pt',
      color: 'grey'
   }
});

export const CanvasTextEdit = (props: ICanvasHtmlShapeEditProps) => {

   const headerClasses = outerStyles();
   const textAreaClasses = textColumnStyles();

   const [value, setValue] = React.useState(props.initialText);

   const onChange: TextareaProps["onChange"] = (ev: React.ChangeEvent<HTMLTextAreaElement>, data: TextareaOnChangeData): void => {
      if (data.value.length <= 1024) {
         setValue(data.value);
      }
   };

   // Move focus to text area in the next tick of the event loop
   setTimeout(() => {
      moveFocus (textFieldId);
   }, 0);

   // Measure the height we need for the given text
   var dyNeeded: number = calculateDyNeeded(props, value);

   // Position the text field where we need it given the length of text
   var y = props.boundary.y + ((props.boundary.dy - dyNeeded) / 2);

   return (
      <div className={headerClasses.root}
         style={{
            top: (y - borderTop).toString() + 'px',
            left: (props.boundary.x).toString() + 'px',
            width: (props.boundary.dx).toString() + 'px',
            height: (dyNeeded + borderTop + borderBottom).toString() + 'px'
         }}
         onBlur={(e) => handleBlur (TextShape.textID(), e, props, value)}
      >  
         <div className={textAreaClasses.root}>
            <Textarea
               id={textFieldId}
               appearance="outline"
               placeholder="Type here..."
               textarea={{ className: textAreaClasses.textarea }}
               resize="none"
               value={value}
               onChange={onChange}
               style={{
                  height: (dyNeeded + borderBottom + borderTop).toString() + 'px'
               }}
               onKeyDown={(e) => handleCommitKeyDown(TextShape.textID(), e, props, value)}               
            />
            <br />
            <div className={textAreaClasses.prompt}>Ctrl+Enter or Esc to finish editing.</div>
         </div>
      </div>
   );
}


type OnCommit = (shapeId: string, tool: EUIActions, text: string) => void;

//
 * Parameters passed to any HtmlShape
 * @param boundary - bounding rectangle for the component
 * @param initialText - initial test value
 * @param lineHeight - hight of  aline on the Canvas
 * @param spaceCharWidth - width of a space character on the Canvas
//
export interface ICanvasHtmlShapeProps {

   id: string;
   boundary: GRect;
   initialText: string;
   lineHeight: number;
   spaceCharWidth: number;
}

export interface ICanvasHtmlShapesProps extends ICanvasHtmlShapeProps {

   shapes: Map<string, Shape>;
}

//
 * Parameters passed to an editable HtmlShape
 * @param onCommit - function that gets called when edit is finished
//
export interface ICanvasHtmlShapeEditProps extends ICanvasHtmlShapeProps {

   onCommit: OnCommit;
   interactor: HtmlEditInteractor;
}

//
 * looks to see if the target element is losing focus to an external element, and if so processes a Commit
 * @param shapeid - string identifying the shape type
 * @param event - Focus Event
 * @param props - generic properties passed to the HTML edit component
 * @param value - current text value
//
export function handleBlur(shapeId: string, event: React.FocusEvent<HTMLDivElement>, props: ICanvasHtmlShapeEditProps, value: string) {

   const currentTarget = event.currentTarget;

   // Check the newly focused element in the next tick of the event loop
   setTimeout(() => {
      // Check if the new activeElement is a child of the original container
      if (!currentTarget.contains(document.activeElement) && (!closed)) {
         props.onCommit(shapeId, EUIActions.Ok, value);
      }
   }, 0);
};

//
 * processes a Commit
 * @param shapeid - string identifying the shape type
 * @param props - generic properties passed to the HTML edit component
 * @param value - current text value
//
export function handleCommit(shapeId: string, action: EUIActions, props: ICanvasHtmlShapeEditProps, value: string): void {

   props.onCommit(shapeId, action, value);
};

//
 * looks to see if the user has pressed 'escape' or Ctrl-enter, and if so processes a Commit
 * @param shapeid - string identifying the shape type* 
 * @param event - Keyboard Event
 * @param props - generic properties passed to the HTML edit component
 * @param value - current text value
//
export function handleCommitKeyDown(shapeId: string, event: React.KeyboardEvent<HTMLElement>, props: ICanvasHtmlShapeEditProps, value: string) {

   var processed: boolean = false;

   switch (event.key) {

      case 'Escape':
         handleCommit(shapeId, EUIActions.Cancel, props, value);
         processed = true;
         break;

      case 'Enter':
         if (event.ctrlKey) {
            handleCommit(shapeId, EUIActions.Ok, props, value);
            processed = true;
         }
         break;

      default:
         break;
   }

   if (processed) {
      event.stopPropagation();
      event.preventDefault();
   }
};

//
 * Move focus to the text element, suppressing scrolling & highlighting
 * @param textFieldId - id of the text element
//
export function moveFocus (textFieldId: string): void {

   let textAreaDiv = document.getElementById(textFieldId);
   if (textAreaDiv) {
      let opts = { preventScroll: true, focusVisible: false };
      textAreaDiv.focus(opts);
   }
};

//
 * Measure the height we need for the given text, ideally by measuring in a Canvas, with a fallback for down-level browsers
 * @param props - generic properties passed to the HTML edit component
 * @param value - current text value
//
export function calculateDyNeeded (props: ICanvasHtmlShapeEditProps, value: string): number {

   var dyNeeded: number;

   if (typeof OffscreenCanvas !== "undefined") {

      let offScreenCanvas = new OffscreenCanvas(props.boundary.dx, props.boundary.dy);
      let offscreenContext = offScreenCanvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
      offscreenContext.font = "18pt Short Stack, cursive";

      dyNeeded = wrapText(offscreenContext, value,
         props.boundary.x,
         props.boundary.y,
         props.boundary.dx,
         props.lineHeight,
         props.spaceCharWidth,
         false);

      // Tidy up
      offScreenCanvas = null
      offscreenContext = null;
   }
   else {

      // Fallback for downlevel browsers - estimate using fixed width font assumption
      dyNeeded = wrapText(null, value,
         props.boundary.x,
         props.boundary.y,
         props.boundary.dx,
         props.lineHeight,
         props.spaceCharWidth,
         false);
   }

   return dyNeeded;
}

*/