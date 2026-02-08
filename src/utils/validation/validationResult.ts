export const validationResult = (schema: any, req: any, res: any) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const firstError =
      result.error?.errors?.[0]?.message || "Validation error.";
    res.status(400).json({ message: firstError });
    return false;
  }

  return true;
};