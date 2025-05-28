export function mergeSortNotes(notes) {
  if (notes.length <= 1) return notes;

  // Sort by department first
  const sortedByDepartment = mergeSortByField(notes, 'department');
  
  // Then sort by semester within each department
  const sortedBySemester = sortedByDepartment.map(deptGroup => {
    return mergeSortByField(deptGroup, 'semester');
  }).flat();
  
  // Finally sort by subject within each semester
  const finalSorted = sortedBySemester.map(semesterGroup => {
    return mergeSortByField(semesterGroup, 'subject');
  }).flat();
  
  return finalSorted;
}

function mergeSortByField(arr, field) {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = arr.slice(0, mid);
  const right = arr.slice(mid);

  return mergeByField(
    mergeSortByField(left, field),
    mergeSortByField(right, field),
    field
  );
}

function mergeByField(left, right, field) {
  const result = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    const leftValue = left[leftIndex][field];
    const rightValue = right[rightIndex][field];
    
    // Handle different field types (string or number)
    const comparison = typeof leftValue === 'string' 
      ? leftValue.localeCompare(rightValue)
      : leftValue - rightValue;
    
    if (comparison <= 0) {
      result.push(left[leftIndex]);
      leftIndex++;
    } else {
      result.push(right[rightIndex]);
      rightIndex++;
    }
  }

  return [
    ...result,
    ...left.slice(leftIndex),
    ...right.slice(rightIndex)
  ];
}

export function groupNotesByField(notes, field) {
  const groups = {};
  notes.forEach(note => {
    const value = note[field];
    if (!groups[value]) {
      groups[value] = [];
    }
    groups[value].push(note);
  });
  return groups;
}

export function getSortedNoteGroups(notes) {
  // First group by department
  const departments = groupNotesByField(notes, 'department');
  
  // Then group by semester within each department
  const departmentGroups = Object.entries(departments).map(([dept, deptNotes]) => {
    const semesters = groupNotesByField(deptNotes, 'semester');
    return {
      department: dept,
      semesters: Object.entries(semesters).map(([sem, semNotes]) => {
        return {
          semester: sem,
          subjects: groupNotesByField(semNotes, 'subject')
        };
      })
    };
  });
  
  return departmentGroups;
}
