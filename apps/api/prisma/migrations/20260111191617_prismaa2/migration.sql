-- CreateIndex
CREATE INDEX "Conversation_restaurantId_lastMessageAt_idx" ON "Conversation"("restaurantId", "lastMessageAt");
