
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EmbryoMorphologyProps {
  embryoId: string;
  developmentDay: string;
  blastocystExpansion: string;
  innerCellMassGrade: string;
  trophectodermGrade: string;
  zonaPellucidaThickness: string;
  cellNumber: string;
  fragmentationPercentage: string;
  symmetryScore: string;
  cytoplasmicAppearance: string;
  hasMultinucleation: string;
  onEmbryoIdChange: (value: string) => void;
  onDevelopmentDayChange: (value: string) => void;
  onBlastocystExpansionChange: (value: string) => void;
  onInnerCellMassGradeChange: (value: string) => void;
  onTrophectodermGradeChange: (value: string) => void;
  onZonaPellucidaThicknessChange: (value: string) => void;
  onCellNumberChange: (value: string) => void;
  onFragmentationPercentageChange: (value: string) => void;
  onSymmetryScoreChange: (value: string) => void;
  onCytoplasmicAppearanceChange: (value: string) => void;
  onHasMultinucleationChange: (value: string) => void;
}

export const EmbryoMorphology = ({
  embryoId,
  developmentDay,
  blastocystExpansion,
  innerCellMassGrade,
  trophectodermGrade,
  zonaPellucidaThickness,
  cellNumber,
  fragmentationPercentage,
  symmetryScore,
  cytoplasmicAppearance,
  hasMultinucleation,
  onEmbryoIdChange,
  onDevelopmentDayChange,
  onBlastocystExpansionChange,
  onInnerCellMassGradeChange,
  onTrophectodermGradeChange,
  onZonaPellucidaThicknessChange,
  onCellNumberChange,
  onFragmentationPercentageChange,
  onSymmetryScoreChange,
  onCytoplasmicAppearanceChange,
  onHasMultinucleationChange,
}: EmbryoMorphologyProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Embryo Morphological Features</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="embryoId">Embryo ID</Label>
          <Input
            id="embryoId"
            value={embryoId}
            onChange={(e) => onEmbryoIdChange(e.target.value)}
            placeholder="Unique identifier"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="developmentDay">Day of Development</Label>
          <Select value={developmentDay} onValueChange={onDevelopmentDayChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Day 3</SelectItem>
              <SelectItem value="5">Day 5</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="blastocystExpansion">Blastocyst Expansion Grade</Label>
          <Select value={blastocystExpansion} onValueChange={onBlastocystExpansionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              {['1', '2', '3', '4', '5', '6'].map((grade) => (
                <SelectItem key={grade} value={grade}>Grade {grade}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="innerCellMassGrade">Inner Cell Mass Grade</Label>
          <Select value={innerCellMassGrade} onValueChange={onInnerCellMassGradeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              {['A', 'B', 'C'].map((grade) => (
                <SelectItem key={grade} value={grade}>Grade {grade}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="trophectodermGrade">Trophectoderm Grade</Label>
          <Select value={trophectodermGrade} onValueChange={onTrophectodermGradeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              {['A', 'B', 'C'].map((grade) => (
                <SelectItem key={grade} value={grade}>Grade {grade}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="zonaPellucidaThickness">Zona Pellucida Thickness (μm)</Label>
          <Input
            id="zonaPellucidaThickness"
            type="number"
            step="0.1"
            value={zonaPellucidaThickness}
            onChange={(e) => onZonaPellucidaThicknessChange(e.target.value)}
            placeholder="Enter thickness"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cellNumber">Cell Number</Label>
          <Input
            id="cellNumber"
            type="number"
            value={cellNumber}
            onChange={(e) => onCellNumberChange(e.target.value)}
            placeholder="For Day 3 embryos"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fragmentationPercentage">Fragmentation Percentage</Label>
          <Input
            id="fragmentationPercentage"
            type="number"
            min="0"
            max="100"
            value={fragmentationPercentage}
            onChange={(e) => onFragmentationPercentageChange(e.target.value)}
            placeholder="Enter percentage"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="symmetryScore">Symmetry Score (1-5)</Label>
          <Input
            id="symmetryScore"
            type="number"
            min="1"
            max="5"
            value={symmetryScore}
            onChange={(e) => onSymmetryScoreChange(e.target.value)}
            placeholder="Rate from 1 to 5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cytoplasmicAppearance">Cytoplasmic Appearance</Label>
          <Select value={cytoplasmicAppearance} onValueChange={onCytoplasmicAppearanceChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select appearance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="smooth">Smooth</SelectItem>
              <SelectItem value="granular">Granular</SelectItem>
              <SelectItem value="vacuolated">Vacuolated</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="hasMultinucleation">Multinucleation Present</Label>
          <Select value={hasMultinucleation} onValueChange={onHasMultinucleationChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
