
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Loader2 } from "lucide-react";
import { EmbryoCamera } from "./EmbryoCamera";
import { EmbryoImagePreview } from "./EmbryoImagePreview";
import { useEmbryoImage } from "@/hooks/useEmbryoImage";
import { useEmbryoSubmission } from "@/hooks/useEmbryoSubmission";
import { EmbryoPatientInfo } from "./EmbryoPatientInfo";
import { EmbryoMorphology } from "./EmbryoMorphology";

export const EmbryoSubmissionForm = () => {
  // Original state
  const [description, setDescription] = useState("");
  
  // Patient information state
  const [patientAge, setPatientAge] = useState("");
  const [previousIvfAttempts, setPreviousIvfAttempts] = useState("");
  const [ivfSuccessHistory, setIvfSuccessHistory] = useState("");
  const [underlyingConditions, setUnderlyingConditions] = useState("");
  
  // Morphological features state
  const [embryoId, setEmbryoId] = useState("");
  const [developmentDay, setDevelopmentDay] = useState("");
  const [blastocystExpansion, setBlastocystExpansion] = useState("");
  const [innerCellMassGrade, setInnerCellMassGrade] = useState("");
  const [trophectodermGrade, setTrophectodermGrade] = useState("");
  const [zonaPellucidaThickness, setZonaPellucidaThickness] = useState("");
  const [cellNumber, setCellNumber] = useState("");
  const [fragmentationPercentage, setFragmentationPercentage] = useState("");
  const [symmetryScore, setSymmetryScore] = useState("");
  const [cytoplasmicAppearance, setCytoplasmicAppearance] = useState("");
  const [hasMultinucleation, setHasMultinucleation] = useState("");

  const {
    imageUrl,
    isLoading: isImageLoading,
    isCameraActive,
    videoRef,
    startCamera,
    stopCamera,
    captureImage,
    handleImageUpload,
    handleImageRemove,
    reset: resetImage,
  } = useEmbryoImage();

  const resetForm = () => {
    setDescription("");
    setPatientAge("");
    setPreviousIvfAttempts("");
    setIvfSuccessHistory("");
    setUnderlyingConditions("");
    setEmbryoId("");
    setDevelopmentDay("");
    setBlastocystExpansion("");
    setInnerCellMassGrade("");
    setTrophectodermGrade("");
    setZonaPellucidaThickness("");
    setCellNumber("");
    setFragmentationPercentage("");
    setSymmetryScore("");
    setCytoplasmicAppearance("");
    setHasMultinucleation("");
    resetImage();
  };

  const { handleSubmit, isLoading: isSubmitting } = useEmbryoSubmission({
    imageUrl,
    description,
    patientAge: parseInt(patientAge) || null,
    previousIvfAttempts: parseInt(previousIvfAttempts) || null,
    ivfSuccessHistory,
    underlyingConditions: underlyingConditions.split(',').map(c => c.trim()).filter(Boolean),
    embryoIdentifier: embryoId,
    developmentDay: parseInt(developmentDay) || null,
    blastocystExpansionGrade: blastocystExpansion,
    innerCellMassGrade,
    trophectodermGrade,
    zonaPellucidaThickness: parseFloat(zonaPellucidaThickness) || null,
    cellNumber: parseInt(cellNumber) || null,
    fragmentationPercentage: parseFloat(fragmentationPercentage) || null,
    symmetryScore: parseInt(symmetryScore) || null,
    cytoplasmicAppearance,
    hasMultinucleation: hasMultinucleation === 'true',
    onSuccess: resetForm,
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Embryo Image</Label>
        <div className="space-y-4">
          {isCameraActive ? (
            <EmbryoCamera
              videoRef={videoRef}
              onCapture={captureImage}
              onClose={stopCamera}
            />
          ) : (
            <EmbryoImagePreview
              imageUrl={imageUrl}
              onImageRemove={handleImageRemove}
              onImageUpload={handleImageUpload}
              onCameraStart={startCamera}
            />
          )}
        </div>
      </div>

      <EmbryoPatientInfo
        patientAge={patientAge}
        previousIvfAttempts={previousIvfAttempts}
        ivfSuccessHistory={ivfSuccessHistory}
        underlyingConditions={underlyingConditions}
        onPatientAgeChange={setPatientAge}
        onPreviousIvfAttemptsChange={setPreviousIvfAttempts}
        onIvfSuccessHistoryChange={setIvfSuccessHistory}
        onUnderlyingConditionsChange={setUnderlyingConditions}
      />

      <EmbryoMorphology
        embryoId={embryoId}
        developmentDay={developmentDay}
        blastocystExpansion={blastocystExpansion}
        innerCellMassGrade={innerCellMassGrade}
        trophectodermGrade={trophectodermGrade}
        zonaPellucidaThickness={zonaPellucidaThickness}
        cellNumber={cellNumber}
        fragmentationPercentage={fragmentationPercentage}
        symmetryScore={symmetryScore}
        cytoplasmicAppearance={cytoplasmicAppearance}
        hasMultinucleation={hasMultinucleation}
        onEmbryoIdChange={setEmbryoId}
        onDevelopmentDayChange={setDevelopmentDay}
        onBlastocystExpansionChange={setBlastocystExpansion}
        onInnerCellMassGradeChange={setInnerCellMassGrade}
        onTrophectodermGradeChange={setTrophectodermGrade}
        onZonaPellucidaThicknessChange={setZonaPellucidaThickness}
        onCellNumberChange={setCellNumber}
        onFragmentationPercentageChange={setFragmentationPercentage}
        onSymmetryScoreChange={setSymmetryScore}
        onCytoplasmicAppearanceChange={setCytoplasmicAppearance}
        onHasMultinucleationChange={setHasMultinucleation}
      />

      <div className="space-y-2">
        <Label htmlFor="description">Additional Notes</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add any additional observations or notes..."
          className="min-h-[100px]"
        />
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting || isImageLoading || (!imageUrl && !description)}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4 mr-2" />
            Analyze Embryo
          </>
        )}
      </Button>
    </form>
  );
};
