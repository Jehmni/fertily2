
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MentionsInput } from "../MentionsInput";

interface CommentFormProps {
  content: string;
  anonymous: boolean;
  onContentChange: (content: string) => void;
  onAnonymousChange: (checked: boolean) => void;
  onSubmit: () => void;
}

export const CommentForm = ({
  content,
  anonymous,
  onContentChange,
  onAnonymousChange,
  onSubmit
}: CommentFormProps) => {
  return (
    <div className="space-y-2">
      <MentionsInput
        value={content}
        onChange={onContentChange}
        placeholder="Add a supportive comment... Use @ to mention others"
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            checked={anonymous}
            onCheckedChange={onAnonymousChange}
          />
          <Label>Comment Anonymously</Label>
        </div>
        <Button
          onClick={onSubmit}
          disabled={!content}
        >
          Add Comment
        </Button>
      </div>
    </div>
  );
};

