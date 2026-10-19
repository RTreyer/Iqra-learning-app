import React from "react";

import { ACTIVITY_COMPONENTS, type ActivityProps } from "@/components/activities";
import type { Lesson, LessonType } from "@/content/types";

type Props = Omit<ActivityProps<LessonType>, "lesson"> & { lesson: Lesson };

/** Narrows the lesson union so each activity receives its own lesson type. */
export function ActivityHost({ lesson, ...props }: Props) {
  switch (lesson.type) {
    case "story": {
      const Activity = ACTIVITY_COMPONENTS.story;
      return <Activity lesson={lesson} {...props} />;
    }
    case "naming": {
      const Activity = ACTIVITY_COMPONENTS.naming;
      return <Activity lesson={lesson} {...props} />;
    }
    case "letter_pick": {
      const Activity = ACTIVITY_COMPONENTS.letter_pick;
      return <Activity lesson={lesson} {...props} />;
    }
    case "word_read": {
      const Activity = ACTIVITY_COMPONENTS.word_read;
      return <Activity lesson={lesson} {...props} />;
    }
    case "listen_pick": {
      const Activity = ACTIVITY_COMPONENTS.listen_pick;
      return <Activity lesson={lesson} {...props} />;
    }
    case "behavior": {
      const Activity = ACTIVITY_COMPONENTS.behavior;
      return <Activity lesson={lesson} {...props} />;
    }
    case "matching": {
      const Activity = ACTIVITY_COMPONENTS.matching;
      return <Activity lesson={lesson} {...props} />;
    }
    case "trace": {
      const Activity = ACTIVITY_COMPONENTS.trace;
      return <Activity lesson={lesson} {...props} />;
    }
    case "build_word": {
      const Activity = ACTIVITY_COMPONENTS.build_word;
      return <Activity lesson={lesson} {...props} />;
    }
    case "counting": {
      const Activity = ACTIVITY_COMPONENTS.counting;
      return <Activity lesson={lesson} {...props} />;
    }
    case "arithmetic": {
      const Activity = ACTIVITY_COMPONENTS.arithmetic;
      return <Activity lesson={lesson} {...props} />;
    }
    default:
      return assertNever(lesson);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled lesson type: ${JSON.stringify(value)}`);
}
