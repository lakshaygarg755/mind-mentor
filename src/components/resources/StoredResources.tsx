import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";

export interface Resource {
  _id: string;
  title: string;
  description: string;
  type: string;
  link: string;
}

export interface CuratedResource {
  _id: string;
  topic: string;
  resources: Resource[];
  lastUpdated: string;
}

interface StoredResourcesProps {
  resource: CuratedResource;
  onDelete: (resourceId: string) => void;
}

export function StoredResources({ resource, onDelete }: StoredResourcesProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await apiClient.deleteCuratedResources(resource._id);
      onDelete(resource._id);
      toast({
        variant: "success",
        title: "Success",
        description: "Resources deleted successfully",
      });
    } catch {
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to delete resources",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = resource.lastUpdated 
    ? new Date(resource.lastUpdated).toLocaleDateString()
    : 'Date not available';

  return (
    <Card className="w-full mt-4 sm:mt-8">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <CardTitle className="text-xl sm:text-2xl font-bold break-words">
            Resources for {resource.topic}
          </CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="text-sm">{formattedDate}</Badge>
            <Badge variant="outline" className="text-sm">{resource.resources.length} Resources</Badge>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isDeleting} className="w-full sm:w-auto hover:bg-red-500">
              Delete Resources
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="sm:max-w-[425px]">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete these curated resources.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="w-full sm:w-auto hover:bg-red-500">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {resource.resources.map((item) => (
            <Card key={item._id} className="bg-muted">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <CardTitle className="text-base sm:text-lg font-semibold break-words">
                    {item.title}
                  </CardTitle>
                  <Badge className="text-xs sm:text-sm">{item.type}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <p className="text-xs sm:text-sm text-muted-foreground break-words">
                  {item.description}
                </p>
                <Button 
                  variant="outline" 
                  className="w-full text-sm sm:text-base py-2 sm:py-4"
                  onClick={() => window.open(item.link, '_blank')}
                >
                  Visit Resource <ExternalLink className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}