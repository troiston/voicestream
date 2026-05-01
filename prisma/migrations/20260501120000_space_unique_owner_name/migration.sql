-- AddUniqueConstraint: Space(ownerId, name)
CREATE UNIQUE INDEX "space_ownerId_name_key" ON "space"("ownerId", "name");
