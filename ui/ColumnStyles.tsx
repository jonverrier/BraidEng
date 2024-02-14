// Fluent
import {
   FluentProvider, teamsDarkTheme, makeStyles, Text
} from '@fluentui/react-components';

export const innerColumnStyles = makeStyles({
   root: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',    // start layout at the top       
      alignItems: 'center',
      maxWidth: '720px'
   },
});

export const innerColumnMidStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'row'
   },
});

export const innerColumnFooterStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'row',
      marginTop: 'auto',
      alignSelf: 'flex-end'      
   },
});

export const textFieldStyles = makeStyles({
   root: {    
      width: '100%'
   },
});