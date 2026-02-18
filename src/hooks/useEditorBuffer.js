import {useCallback} from 'react';
import {openEditorForEntries} from '../services/editorBufferService.js';
import timeEntryModel from '../models/timeEntry.js';
import {clearTerminal} from '../utils.js';

const useEditorBuffer = triggerReload => {
  const openEditor = useCallback(
    async (entries, taskTitle) => {
      if (entries.length === 0) return;

      try {
        const result = openEditorForEntries(entries, taskTitle);

        if (result) {
          const {updates, deletes} = result;
          for (const id of deletes) await timeEntryModel.delete(id);
          for (const update of updates) await timeEntryModel.update(update);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Editor error:', err.message);
      }

      clearTerminal();
      triggerReload();
    },
    [triggerReload],
  );

  return {openEditor};
};

export default useEditorBuffer;
