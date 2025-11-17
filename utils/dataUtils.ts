// utils/dataUtils.ts

/**
 * Exports an array of data to a JSON file and triggers a download.
 * @param data The array of data to export.
 * @param filename The desired filename (without extension).
 */
export const exportToJSON = <T>(data: T[], filename: string) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  alert(`Data exported to ${filename}.json successfully!`);
};

/**
 * Imports data from a JSON file, generating new unique IDs for all imported items.
 * @param file The File object to import.
 * @param idPrefix The prefix for generating new IDs (e.g., 'cust', 'deal').
 * @returns A Promise that resolves with the array of imported items.
 */
export const importFromJSON = async <T extends { id: string }>(file: File, idPrefix: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        const importedData: T[] = JSON.parse(jsonString);

        if (!Array.isArray(importedData)) {
          throw new Error('Imported JSON is not an array.');
        }

        const newIdData = importedData.map(item => ({
          ...item,
          id: `${idPrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Generate new unique ID
        }));
        resolve(newIdData);
      } catch (error: any) {
        reject(new Error(`Error parsing JSON file: ${error.message}`));
      }
    };
    reader.onerror = (error) => {
      reject(new Error(`Error reading file: ${error.type}`));
    };
    reader.readAsText(file);
  });
};