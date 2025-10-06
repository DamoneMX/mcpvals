import chalk from "chalk";
import { TraceStore } from "../core/trace.js";
import { ConversationMessage } from "../../types/trace.js";

export class TraceStoreReporter {
  /**
   * Report trace store data to the console
   */
  report(traceStore: TraceStore): void {
    const traceData = traceStore.export();

    console.log("\n" + chalk.bold.underline("Conversation Trace"));
    console.log("=".repeat(80));

    // Display summary
    this.reportSummary(traceData);

    if (traceData.conversation.length === 0) {
      console.log(chalk.gray("\nNo conversation messages to display"));
      return;
    }

    console.log("\n" + chalk.bold("Messages:"));
    console.log("-".repeat(80));

    // Iterate over conversation messages
    traceData.conversation.forEach((message, index) => {
      this.reportMessage(message, index + 1);
    });

    console.log("\n" + "=".repeat(80));
  }

  /**
   * Report summary statistics
   */
  private reportSummary(traceData: ReturnType<TraceStore["export"]>): void {
    console.log(`\n${chalk.bold("Summary:")}`);
    console.log(
      `  Messages: ${chalk.cyan(traceData.conversation.length.toString())}`,
    );

    const totalToolCalls = traceData.conversation.reduce(
      (sum, msg) => sum + (msg.toolCalls?.length || 0),
      0,
    );
    console.log(`  Tool Calls: ${chalk.yellow(totalToolCalls.toString())}`);
  }

  /**
   * Report a single conversation message with its tool calls
   */
  private reportMessage(message: ConversationMessage, index: number): void {
    // Choose color based on role
    const roleColor = message.role === "user" ? chalk.cyan : chalk.green;
    const roleName = message.role === "user" ? "USER" : "ASSISTANT";

    // Format timestamp
    const timestamp = message.timestamp.toISOString();

    // Display message header with timestamp
    console.log(
      `\n${chalk.gray(`[${index}]`)} ${roleColor.bold(`[${roleName}]`)} ${chalk.gray(timestamp)}`,
    );

    // Display message content
    console.log(`${roleColor("│")} ${message.content}`);

    // Display tool calls if present
    if (message.toolCalls && message.toolCalls.length > 0) {
      console.log(`${roleColor("│")}`);
      message.toolCalls.forEach((toolCall, toolIndex) => {
        const isLast = toolIndex === message.toolCalls!.length - 1;
        const prefix = isLast ? "└─" : "├─";
        const toolTimestamp = toolCall.timestamp.toISOString();

        console.log(
          `${roleColor("│")} ${chalk.yellow(`${prefix} Tool Call: ${chalk.bold(toolCall.name)}`)} ${chalk.gray(toolTimestamp)}`,
        );
        console.log(
          `${roleColor("│")}    ${chalk.yellow(`Arguments:`)} ${chalk.gray(JSON.stringify(toolCall.arguments))}`,
        );

        if (!isLast) {
          console.log(`${roleColor("│")}`);
        }
      });
    }
  }
}
