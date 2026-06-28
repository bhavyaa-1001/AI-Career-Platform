import { z } from 'zod';

const trackStatusEnum = z.enum(['applied', 'assessment', 'interview', 'offer', 'rejected', 'withdrawn']);

export const trackingApplicationIdSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const updateTrackStatusSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    trackStatus: trackStatusEnum,
    note: z.string().max(500).optional(),
  }),
});

export const addNoteSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    text: z.string().min(1).max(2000),
  }),
});

export const noteIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    noteId: z.string().min(1),
  }),
  body: z.object({
    text: z.string().min(1).max(2000),
  }),
});

export const deleteNoteSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    noteId: z.string().min(1),
  }),
});

export const addAttachmentUrlSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string().min(1).max(120),
    url: z.string().url().max(500),
    fileType: z.string().max(80).optional(),
  }),
});

export const deleteAttachmentSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    attachmentId: z.string().min(1),
  }),
});

export { trackStatusEnum };
