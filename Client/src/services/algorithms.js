/**
 * Client-side implementation of binary search and merge sort algorithms
 * for improved performance in searching and sorting notes.
 */

/**
 * Binary search implementation
 * @param {Array} arr - Sorted array to search in
 * @param {*} target - Target value to find
 * @param {string} key - Object key to compare (if searching in array of objects)
 * @returns {number} - Index of the found element or -1 if not found
 */
export function binarySearch(arr, target, key = null) {
  if (!Array.isArray(arr) || arr.length === 0) return -1;
  
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midValue = key ? arr[mid][key] : arr[mid];
    
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

/**
 * Implementation of merge sort algorithm
 * @param {Array} arr - Array to sort
 * @param {Function} compareFunc - Function to compare elements
 * @returns {Array} - Sorted array
 */
export function mergeSort(arr, compareFunc) {
  if (!Array.isArray(arr) || arr.length <= 1) return arr;
  
  const compare = compareFunc || ((a, b) => a - b);
  
  const merge = (left, right) => {
    const result = [];
    let leftIndex = 0;
    let rightIndex = 0;
    
    while (leftIndex < left.length && rightIndex < right.length) {
      if (compare(left[leftIndex], right[rightIndex]) <= 0) {
        result.push(left[leftIndex]);
        leftIndex++;
      } else {
        result.push(right[rightIndex]);
        rightIndex++;
      }
    }
    
    return [...result, ...left.slice(leftIndex), ...right.slice(rightIndex)];
  };
  
  const sort = (array) => {
    if (array.length <= 1) return array;
    
    const mid = Math.floor(array.length / 2);
    const left = array.slice(0, mid);
    const right = array.slice(mid);
    
    return merge(sort(left), sort(right));
  };
  
  return sort(arr);
}

/**
 * Merge sort implementation specifically for notes
 * @param {Array} notes - Array of notes to sort
 * @returns {Array} - Sorted array of notes
 */
export function mergeSortNotes(notes) {
  if (!notes || notes.length <= 1) return notes;
  
  return mergeSort(notes, (a, b) => {
    // Sort by department first
    if (a.department !== b.department) {
      return a.department.localeCompare(b.department);
    }
    
    // Then by semester (convert to number for proper comparison)
    const semA = parseInt(a.semester);
    const semB = parseInt(b.semester);
    if (semA !== semB) {
      return semA - semB;
    }
    
    // Finally by subject
    return a.subject.localeCompare(b.subject);
  });
}

/**
 * Filter notes using binary search algorithm
 * @param {Array} notes - Array of notes to filter
 * @param {Object} filters - Filter criteria (department, semester, subject)
 * @returns {Array} - Filtered notes
 */
export function filterNotesWithBinarySearch(notes, filters) {
  if (!notes || notes.length === 0) return [];
  
  // First sort the notes using merge sort
  const sortedNotes = mergeSortNotes(notes);
  
  // If no filters are applied, return all sorted notes
  if (!filters.department && !filters.semester && !filters.subject) {
    return sortedNotes;
  }
  
  // Helper function to check if a note matches all criteria
  const matchesCriteria = (note) => {
    return (
      (!filters.department || note.department === filters.department) &&
      (!filters.semester || String(note.semester) === String(filters.semester)) &&
      (!filters.subject || note.subject === filters.subject)
    );
  };
  
  const matchingNotes = [];
  
  // If we have a department filter, use binary search to find that department
  if (filters.department) {
    let left = 0;
    let right = sortedNotes.length - 1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midNote = sortedNotes[mid];
      
      if (midNote.department === filters.department) {
        // Found a match, now collect all notes with this department
        let i = mid;
        // Look backward
        while (i >= 0 && sortedNotes[i].department === filters.department) {
          if (matchesCriteria(sortedNotes[i])) {
            matchingNotes.push(sortedNotes[i]);
          }
          i--;
        }
        
        // Look forward (but don't re-check the midpoint)
        i = mid + 1;
        while (i < sortedNotes.length && sortedNotes[i].department === filters.department) {
          if (matchesCriteria(sortedNotes[i])) {
            matchingNotes.push(sortedNotes[i]);
          }
          i++;
        }
        
        break;
      } else if (midNote.department < filters.department) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  } else {
    // If no department filter, check all notes
    sortedNotes.forEach(note => {
      if (matchesCriteria(note)) {
        matchingNotes.push(note);
      }
    });
  }
  
  return matchingNotes;
}

/**
 * Search for notes by topic using binary search
 * @param {Array} notes - Array of notes to search in
 * @param {string} searchTerm - Term to search for in topic
 * @returns {Array} - Array of matching notes
 */
export function searchNotesByTopic(notes, searchTerm) {
  if (!searchTerm || !notes || notes.length === 0) return [];
  
  // Sort notes alphabetically by topic for binary search
  const sortedNotes = mergeSort([...notes], (a, b) => 
    a.topic.localeCompare(b.topic)
  );
  
  // Binary search can only find exact matches, so we'll use it as a starting point
  // and then search nearby entries for partial matches
  const term = searchTerm.toLowerCase();
  const results = [];
  
  // Linear search for partial matches (could be optimized further)
  for (const note of sortedNotes) {
    if (note.topic.toLowerCase().includes(term)) {
      results.push(note);
    }
  }
  
  return results;
}
