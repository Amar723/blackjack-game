"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Coins, CreditCard } from "lucide-react";
import { supabase, updateUserChips } from "@/lib/supabase";

interface BuyChipsModalProps {
  currentChips: number;
  onChipsUpdated: (newChips: number) => void;
  user: any;
}

export default function BuyChipsModal({
  currentChips,
  onChipsUpdated,
  user,
}: BuyChipsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState<number>(100);
  const [isLoading, setIsLoading] = useState(false);

  const chipPackages = [
    { amount: 100, price: 10, bonus: 0 },
    { amount: 250, price: 20, bonus: 25 },
    { amount: 500, price: 35, bonus: 100 },
    { amount: 1000, price: 60, bonus: 300 },
    { amount: 2500, price: 120, bonus: 1000 },
  ];

  const handleBuyChips = async (chipAmount: number) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const newChips = currentChips + chipAmount;
      const success = await updateUserChips(user.id, newChips);

      if (success) {
        onChipsUpdated(newChips);
        setIsOpen(false);
        // In a real app, you'd integrate with a payment processor here
        alert(
          `Successfully added ${chipAmount} chips! (This is a demo - no real payment processed)`
        );
      } else {
        alert("Failed to update chips. Please try again.");
      }
    } catch (error) {
      console.error("Error buying chips:", error);
      alert("Error buying chips. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomAmount = () => {
    if (amount > 0) {
      handleBuyChips(amount);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
          <Coins className="w-4 h-4 mr-2" />
          Buy Chips
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Coins className="w-5 h-5 mr-2 text-yellow-600" />
            Buy Chips
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              Current Chips:{" "}
              <span className="font-semibold text-blue-600">
                ${currentChips}
              </span>
            </p>
          </div>

          {/* Chip Packages */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Chip Packages</Label>
            <div className="grid grid-cols-1 gap-2">
              {chipPackages.map((pkg) => (
                <Card
                  key={pkg.amount}
                  className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleBuyChips(pkg.amount)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">${pkg.amount} Chips</div>
                      {pkg.bonus > 0 && (
                        <div className="text-sm text-green-600">
                          +{pkg.bonus} Bonus!
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${pkg.price}</div>
                      <div className="text-xs text-gray-500">Demo Price</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="space-y-3">
            <Label htmlFor="custom-amount" className="text-sm font-medium">
              Custom Amount
            </Label>
            <div className="flex space-x-2">
              <Input
                id="custom-amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                min="1"
                className="flex-1"
              />
              <Button
                onClick={handleCustomAmount}
                disabled={amount <= 0 || isLoading}
                variant="outline"
              >
                Add
              </Button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <CreditCard className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Demo Mode</p>
                <p>
                  No real payment is processed. Chips are added instantly for
                  testing purposes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
