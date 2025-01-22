export interface GraphQLErrorExtension {
    exception?: {
      stacktrace?: string[];
    };
    code?: string;
  }
  
  export interface GraphQLFormattedError {
    message: string;
    path?: string[];
    extensions?: GraphQLErrorExtension;
  }