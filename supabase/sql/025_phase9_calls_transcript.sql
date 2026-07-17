-- Replace the manual next_steps field with a transcript field: pasting the
-- raw call transcript (from Zoom/Meet/etc.) is what Lesson 3's AI analysis
-- will consume, making a manually-typed "next step" redundant with what AI
-- will be able to extract from the transcript itself.
alter table public.calls drop column next_steps;
alter table public.calls add column transcript text;
