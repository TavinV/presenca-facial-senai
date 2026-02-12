import cron from "node-cron";
import ClassSession from "../models/classSessionModel.js"

export const startAutoCloseClassesJob = () => {
  // Roda a cada 1 minuto
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      
      const result = await ClassSession.updateMany(
        {
          status: "active",
          endsAt: { $lt: now },
        },
        {
          $set: {
            status: "closed",
            closedAt: now,
          },
        }
      );

      if (result.modifiedCount > 0) {
        console.log(
          `[CRON] ${result.modifiedCount} aulas fechadas automaticamente`
        );
      }
    } catch (error) {
      console.error("[CRON ERROR] Erro ao fechar aulas:", error);
    }
  });
};
