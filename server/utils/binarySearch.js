export function binarySearch(arr, target, key = 'id') {
  if (!Array.isArray(arr)) return -1;
  
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midValue = arr[mid][key];
    
    if (midValue === target) {
      return mid;
    } else if (midValue < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}

import { mergeSortNotes } from './mergeSort.js';

export function binarySearchNotes(notes, searchParams) {
  // Sort notes using specialized merge sort for notes
  const sortedNotes = mergeSortNotes(notes);

  // Helper function to check if note matches all search criteria
  const matchesCriteria = (note) => {
    return (
      (!searchParams.department || note.department === searchParams.department) &&
      (!searchParams.semester || note.semester === searchParams.semester) &&
      (!searchParams.subject || note.subject === searchParams.subject)
    );
  };

  // Binary search implementation
  let left = 0;
  let right = sortedNotes.length - 1;
  const matchingNotes = [];

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midNote = sortedNotes[mid];

    if (matchesCriteria(midNote)) {
      matchingNotes.push(midNote);
      
      // Look for other matching notes to the left
      let tempLeft = mid - 1;
      while (tempLeft >= left && matchesCriteria(sortedNotes[tempLeft])) {
        matchingNotes.push(sortedNotes[tempLeft]);
        tempLeft--;
      }
      
      // Look for other matching notes to the right
      let tempRight = mid + 1;
      while (tempRight <= right && matchesCriteria(sortedNotes[tempRight])) {
        matchingNotes.push(sortedNotes[tempRight]);
        tempRight++;
      }
      
      break;
    }

    // Adjust search range based on search criteria
    if (!searchParams.department || midNote.department < searchParams.department) {
      left = mid + 1;
    } else if (!searchParams.semester || midNote.semester < searchParams.semester) {
      left = mid + 1;
    } else if (!searchParams.subject || midNote.subject < searchParams.subject) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return matchingNotes;
}
