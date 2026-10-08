import { Link } from "react-router-dom";
import { PawPrint, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center p-6">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold">Neurolog</h1>
        <p className="text-muted-foreground mt-2 text-sm">Bạn là ai?</p>
      </div>
      <div className="grid w-full gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Phụ huynh
            </CardTitle>
            <CardDescription>
              Giao việc, duyệt, xem nhật ký và báo cáo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/parent">Vào góc phụ huynh</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PawPrint className="size-5" />
              Trẻ em
            </CardTitle>
            <CardDescription>
              Làm nhiệm vụ, nuôi pet, chat AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/child">Vào góc của bé</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
