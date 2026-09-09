import Business from "@/models/Business";

export function getBusinessForOwner(ownerId: string) {
    return Business.findOne({ owner: ownerId });
}
