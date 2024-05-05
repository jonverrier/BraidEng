/*! Copyright TXPCo 2022 */

// React
import React from 'react';

// Fluent
import { makeStyles, tokens, Textarea, TextareaProps, TextareaOnChangeData } from '@fluentui/react-components';

// Local 
import { TextShape } from './Text';
import { ICanvasHtmlShapeEditProps, handleBlur, handleCommitKeyDown, moveFocus, calculateDyNeeded } from './CanvasHtmlHelpers';

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
