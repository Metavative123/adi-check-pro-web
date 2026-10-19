// The fault items on the DVSA driving test report (form DL25), in the order
// and under the headings they appear on the form.
//
// Mirrors the API's src/config/dl25.js, which checks every entry. Keys are
// stored on every detailed test, so a key must never be renamed or reused.
//
// Every item takes driving faults (a count) and a serious and a dangerous
// mark, except the eyesight test, which can only be marked serious.
export type FaultMarks = { driving: number; serious: number; dangerous: number };
export type FaultItems = Record<string, FaultMarks>;

export type Dl25Item = {
  key: string;
  label: string;
  drivingFaults: boolean;
  dangerous: boolean;
};

export type Dl25Group = { key: string; label: string; items: Dl25Item[] };

type ItemSpec = [key: string, label: string, marks?: { drivingFaults?: boolean; dangerous?: boolean }];

const SPEC: { key: string; label: string; items: ItemSpec[] }[] = [
  { key: "eyesight", label: "Eyesight test", items: [["eyesight", "Eyesight test", { drivingFaults: false, dangerous: false }]] },
  { key: "manoeuvres", label: "Manoeuvres", items: [["control", "Control"], ["observation", "Observation"]] },
  { key: "showMeTellMe", label: "Show me / Tell me", items: [["showMeTellMe", "Show me / Tell me"]] },
  { key: "controlledStop", label: "Controlled stop", items: [["controlledStop", "Controlled stop"]] },
  {
    key: "control",
    label: "Control",
    items: [
      ["accelerator", "Accelerator"],
      ["clutch", "Clutch"],
      ["gears", "Gears"],
      ["footbrake", "Footbrake"],
      ["parkingBrake", "Parking brake"],
      ["steering", "Steering"],
    ],
  },
  { key: "precautions", label: "Precautions", items: [["precautions", "Precautions"]] },
  { key: "ancillaryControls", label: "Ancillary controls", items: [["ancillaryControls", "Ancillary controls"]] },
  { key: "moveOff", label: "Move off", items: [["safety", "Safety"], ["control", "Control"]] },
  {
    key: "mirrors",
    label: "Use of mirrors",
    items: [["signalling", "Signalling"], ["changeDirection", "Change direction"], ["changeSpeed", "Change speed"]],
  },
  { key: "signals", label: "Signals", items: [["necessary", "Necessary"], ["correctly", "Correctly"], ["timed", "Timed"]] },
  {
    key: "junctions",
    label: "Junctions",
    items: [
      ["approachSpeed", "Approach speed"],
      ["observation", "Observation"],
      ["turningRight", "Turning right"],
      ["turningLeft", "Turning left"],
      ["cuttingCorners", "Cutting corners"],
    ],
  },
  { key: "judgement", label: "Judgement", items: [["overtaking", "Overtaking"], ["meeting", "Meeting"], ["crossing", "Crossing"]] },
  { key: "positioning", label: "Positioning", items: [["normalDriving", "Normal driving"], ["laneDiscipline", "Lane discipline"]] },
  { key: "pedestrianCrossings", label: "Pedestrian crossings", items: [["pedestrianCrossings", "Pedestrian crossings"]] },
  { key: "positionNormalStop", label: "Position / normal stop", items: [["positionNormalStop", "Position / normal stop"]] },
  { key: "awarenessPlanning", label: "Awareness planning", items: [["awarenessPlanning", "Awareness planning"]] },
  { key: "clearance", label: "Clearance", items: [["clearance", "Clearance"]] },
  { key: "followingDistance", label: "Following distance", items: [["followingDistance", "Following distance"]] },
  { key: "useOfSpeed", label: "Use of speed", items: [["useOfSpeed", "Use of speed"]] },
  { key: "progress", label: "Progress", items: [["appropriateSpeed", "Appropriate speed"], ["undueHesitation", "Undue hesitation"]] },
  {
    key: "responseToSigns",
    label: "Response to signs / signals",
    items: [
      ["trafficSigns", "Traffic signs"],
      ["roadMarkings", "Road markings"],
      ["trafficLights", "Traffic lights"],
      ["trafficControllers", "Traffic controllers"],
      ["otherRoadUsers", "Other road users"],
    ],
  },
];

export const DL25_GROUPS: Dl25Group[] = SPEC.map((group) => ({
  key: group.key,
  label: group.label,
  items: group.items.map(([key, label, marks = {}]) => ({
    key: `${group.key}.${key}`,
    label,
    drivingFaults: marks.drivingFaults !== false,
    dangerous: marks.dangerous !== false,
  })),
}));

// Generous, but stops a slip of the thumb; the API has the same limit.
export const MAX_DRIVING_PER_ITEM = 20;

export const NO_MARKS: FaultMarks = { driving: 0, serious: 0, dangerous: 0 };

export function totalsFromItems(items: FaultItems): FaultMarks {
  const totals = { ...NO_MARKS };
  for (const marks of Object.values(items)) {
    totals.driving += marks.driving;
    totals.serious += marks.serious;
    totals.dangerous += marks.dangerous;
  }
  return totals;
}

// Only the items with something marked, as the API stores them.
export function markedItems(items: FaultItems): FaultItems {
  return Object.fromEntries(
    Object.entries(items).filter(([, m]) => m.driving + m.serious + m.dangerous > 0)
  );
}
