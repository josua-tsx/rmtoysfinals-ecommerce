import { handleMakeError } from "./handleError.js";
import { z } from "zod";

export const validateResource = (schema) => (req, res, next) => {
  try {
    const { body, query, params } = req;
    
    // Parse the request data against the schema
    const parsedData = schema.parse({
      body,
      query,
      params,
    });
    
    // Replace req properties with parsed/validated data
    // Use a safe approach for read-only properties like query/params
    req.body = parsedData.body;
    
    if (parsedData.query) {
      try {
        req.query = parsedData.query;
      } catch (e) {
        // Fallback: if req.query is a getter, we can't reassign the object, 
        // but we might be able to modify its properties
        Object.assign(req.query, parsedData.query);
      }
    }
    
    if (parsedData.params) {
      try {
        req.params = parsedData.params;
      } catch (e) {
        Object.assign(req.params, parsedData.params);
      }
    }
    
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues || error.errors || [];

      // Build user-friendly messages with field names
      const formattedErrors = issues.map((issue) => {
        // Get the field name from the path (skip "body", "params", "query" prefix)
        const fieldPath = issue.path
          .filter((p) => !["body", "params", "query"].includes(p))
          .join(".");
        
        if (fieldPath) {
          return `${fieldPath}: ${issue.message}`;
        }
        return issue.message;
      });

      // Return only the first error for cleaner UX
      const errorMessage = formattedErrors[0] || "Validation failed";
        
      console.error("Validation Error:", formattedErrors.join(" | ")); // Log all for debugging
      return next(handleMakeError(400, errorMessage));
    }
    next(error);
  }
};
