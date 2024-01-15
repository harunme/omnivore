-- Type: UNDO
-- Name: add_content_not_fetched_to_library_item_state
-- Description: Add CONTENT_NOT_FETCHED to the library_item_state enum

BEGIN;

ALTER TABLE omnivore.library_item
    ADD COLUMN subscription_id text;

COMMIT;
