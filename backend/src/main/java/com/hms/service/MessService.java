package com.hms.service;

import com.hms.model.MessMenu;
import com.hms.model.MessMenuItem;
import com.hms.repository.MessMenuItemRepository;
import com.hms.repository.MessMenuRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessService {

    private final MessMenuRepository menuRepository;
    private final MessMenuItemRepository menuItemRepository;

    public Optional<MessMenu> getLatestMenu(Long hostelId) {
        return menuRepository.findTopByHostelIdOrderByCreatedAtDesc(hostelId);
    }

    @Transactional
    public MessMenu saveOrUpdateMenu(Long hostelId, MessMenu menuData) {
        menuData.setHostelId(hostelId);
        
        // Remove old items if updating (simplification for this logic)
        if (menuData.getId() != null) {
            MessMenu existing = menuRepository.findById(menuData.getId())
                    .orElseThrow(() -> new RuntimeException("Menu not found"));
            // IDOR check: only the hostel that owns this menu may update it
            if (!existing.getHostelId().equals(hostelId)) {
                throw new RuntimeException("Unauthorized: this menu does not belong to your hostel");
            }
            existing.setMenuType(menuData.getMenuType());
            existing.setMonth(menuData.getMonth());
            existing.setYear(menuData.getYear());
            existing.getItems().clear();
            existing.getItems().addAll(menuData.getItems());
            menuData.getItems().forEach(item -> item.setMenu(existing));
            return menuRepository.save(existing);
        } else {
            menuData.getItems().forEach(item -> item.setMenu(menuData));
            return menuRepository.save(menuData);
        }
    }

    @Transactional
    public MessMenu importExcel(InputStream is, Long hostelId) throws IOException {
        Workbook workbook = new XSSFWorkbook(is);
        Sheet sheet = workbook.getSheetAt(0);

        MessMenu menu = new MessMenu();
        menu.setHostelId(hostelId);
        List<MessMenuItem> items = new ArrayList<>();

        String[] days = {"MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"};
        String[] meals = {"BREAKFAST", "LUNCH", "SNACKS", "DINNER"};

        // 1. Parse Title (MESS MENU: MONTH YEAR)
        Row titleRow = sheet.getRow(0);
        if (titleRow != null && titleRow.getCell(0) != null) {
            String title = titleRow.getCell(0).getStringCellValue();
            if (title.contains(": ")) {
                String parts[] = title.split(": ")[1].split(" ");
                if (parts.length >= 2) {
                    menu.setMonth(parts[0]);
                    menu.setYear(Integer.parseInt(parts[1]));
                }
            }
        }

        // 2. Iterate and find tables
        int cycleCount = 0;
        int maxRows = sheet.getLastRowNum();
        for (int r = 1; r <= maxRows; r++) {
            Row row = sheet.getRow(r);
            if (row == null || row.getCell(0) == null) continue;

            String cellVal = row.getCell(0).getStringCellValue().toUpperCase();
            
            // Check for Cycle Header
            if (cellVal.startsWith("WEEK")) {
                cycleCount++;
                // Skip next row (the Day header row: MEAL | MON | TUE...)
                r++; 

                // Read next 4 rows for meals
                for (int m = 0; m < 4; m++) {
                    r++;
                    Row mealRow = sheet.getRow(r);
                    if (mealRow == null) break;
                    
                    String mealType = mealRow.getCell(0).getStringCellValue().toUpperCase();
                    for (int d = 0; d < 7; d++) {
                        Cell foodCell = mealRow.getCell(d + 1);
                        String foodItems = (foodCell != null) ? foodCell.getStringCellValue() : "-";
                        
                        MessMenuItem item = new MessMenuItem();
                        item.setMenu(menu);
                        item.setDay(days[d]);
                        item.setMealType(mealType);
                        item.setFoodItems(foodItems);
                        item.setWeekCycle(cycleCount);
                        items.add(item);
                    }
                }
            }
        }

        // Determine menuType based on cycleCount
        if (cycleCount == 1) menu.setMenuType("WEEKLY");
        else if (cycleCount == 2) menu.setMenuType("MONTHLY_CYCLE");
        else menu.setMenuType("MONTHLY_FULL");

        menu.setItems(items);
        workbook.close();

        // If exists, find the latest and update it instead of creating new? 
        // For simplicity, let's create a NEW one or update if month/year match.
        return saveOrUpdateMenu(hostelId, menu);
    }

    public byte[] generatePdf(Long menuId, Long hostelId) throws IOException {
        MessMenu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new RuntimeException("Menu not found"));
        // IDOR check: only members of the hostel that owns this menu may download it
        if (!menu.getHostelId().equals(hostelId)) {
            throw new RuntimeException("Unauthorized: this menu does not belong to your hostel");
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate(), 30, 30, 30, 30);
        PdfWriter.getInstance(document, baos);

        document.open();
        
        // Main Title
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, java.awt.Color.BLACK);
        Paragraph title = new Paragraph("MESS MENU: " + menu.getMonth().toUpperCase() + " - " + menu.getYear(), titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        String[] days = {"MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"};
        String[] meals = {"BREAKFAST", "LUNCH", "SNACKS", "DINNER"};

        int maxCycles = menu.getItems().stream().mapToInt(MessMenuItem::getWeekCycle).max().orElse(1);

        for (int cycle = 1; cycle <= maxCycles; cycle++) {
            final int currentCycle = cycle;
            String cycleTitle = menu.getMenuType().equals("WEEKLY") ? "WEEKLY MENU" : 
                                (menu.getMenuType().equals("MONTHLY_CYCLE") ? (currentCycle == 1 ? "WEEK 1 & 3" : "WEEK 2 & 4") : "WEEK " + currentCycle);
            
            // Cycle Header
            PdfPTable headerTable = new PdfPTable(1);
            headerTable.setWidthPercentage(100);
            PdfPCell headerCell = new PdfPCell(new Phrase(cycleTitle, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, java.awt.Color.WHITE)));
            headerCell.setBackgroundColor(new java.awt.Color(0, 96, 103)); // Primary color
            headerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            headerCell.setPadding(8);
            headerCell.setBorder(Rectangle.NO_BORDER);
            headerTable.addCell(headerCell);
            document.add(headerTable);

            PdfPTable table = new PdfPTable(days.length + 1);
            table.setWidthPercentage(100);
            table.setSpacingBefore(0);

            // Days Header row
            PdfPCell empty = new PdfPCell(new Phrase(""));
            empty.setBackgroundColor(new java.awt.Color(230, 240, 241));
            table.addCell(empty);
            
            for (String day : days) {
                PdfPCell cell = new PdfPCell(new Phrase(day, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new java.awt.Color(0, 96, 103))));
                cell.setBackgroundColor(new java.awt.Color(230, 240, 241));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(8);
                table.addCell(cell);
            }

            // Meal rows
            for (String meal : meals) {
                PdfPCell mealCell = new PdfPCell(new Phrase(meal, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
                mealCell.setBackgroundColor(new java.awt.Color(245, 245, 245));
                mealCell.setPadding(8);
                table.addCell(mealCell);
                
                for (String day : days) {
                    String items = menu.getItems().stream()
                            .filter(i -> i.getWeekCycle() == currentCycle && i.getDay().equalsIgnoreCase(day) && i.getMealType().equalsIgnoreCase(meal))
                            .map(MessMenuItem::getFoodItems)
                            .findFirst().orElse("-");
                    PdfPCell cell = new PdfPCell(new Phrase(items, FontFactory.getFont(FontFactory.HELVETICA, 8)));
                    cell.setPadding(6);
                    cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                    table.addCell(cell);
                }
            }
            document.add(table);
            document.add(new Paragraph(" ")); // Spacing between tables
        }

        document.close();
        return baos.toByteArray();
    }

    public byte[] generateExcel(Long menuId, Long hostelId) throws IOException {
        MessMenu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new RuntimeException("Menu not found"));
        // IDOR check: only members of the hostel that owns this menu may download it
        if (!menu.getHostelId().equals(hostelId)) {
            throw new RuntimeException("Unauthorized: this menu does not belong to your hostel");
        }

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Mess Menu");
        
        // Styles
        CellStyle titleStyle = workbook.createCellStyle();
        org.apache.poi.ss.usermodel.Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 16);
        titleStyle.setFont(titleFont);
        titleStyle.setAlignment(HorizontalAlignment.CENTER);

        CellStyle headerStyle = workbook.createCellStyle();
        headerStyle.setFillForegroundColor(IndexedColors.TEAL.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
        headerFont.setColor(IndexedColors.WHITE.getIndex());
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        headerStyle.setAlignment(HorizontalAlignment.CENTER);
        headerStyle.setBorderBottom(BorderStyle.THIN);
        headerStyle.setBorderTop(BorderStyle.THIN);
        headerStyle.setBorderLeft(BorderStyle.THIN);
        headerStyle.setBorderRight(BorderStyle.THIN);

        CellStyle dataStyle = workbook.createCellStyle();
        dataStyle.setWrapText(true);
        dataStyle.setVerticalAlignment(VerticalAlignment.CENTER);
        dataStyle.setBorderBottom(BorderStyle.THIN);
        dataStyle.setBorderTop(BorderStyle.THIN);
        dataStyle.setBorderLeft(BorderStyle.THIN);
        dataStyle.setBorderRight(BorderStyle.THIN);

        String[] days = {"MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"};
        String[] meals = {"BREAKFAST", "LUNCH", "SNACKS", "DINNER"};
        int maxCycles = menu.getItems().stream().mapToInt(MessMenuItem::getWeekCycle).max().orElse(1);

        int currentRow = 0;

        // Main Title Row
        Row mainTitleRow = sheet.createRow(currentRow++);
        Cell titleCell = mainTitleRow.createCell(0);
        titleCell.setCellValue("MESS MENU: " + menu.getMonth().toUpperCase() + " " + menu.getYear());
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, days.length));
        currentRow++; // extra space

        for (int cycle = 1; cycle <= maxCycles; cycle++) {
            final int currentCycle = cycle;
            String cycleName = menu.getMenuType().equals("WEEKLY") ? "WEEKLY MENU" : 
                              (menu.getMenuType().equals("MONTHLY_CYCLE") ? (currentCycle == 1 ? "WEEK 1 & 3" : "WEEK 2 & 4") : "WEEK " + currentCycle);

            // Cycle Header
            Row subTitleRow = sheet.createRow(currentRow++);
            Cell subTitleCell = subTitleRow.createCell(0);
            subTitleCell.setCellValue(cycleName);
            subTitleCell.setCellStyle(headerStyle);
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(currentRow - 1, currentRow - 1, 0, days.length));

            // Column Header
            Row headerRow = sheet.createRow(currentRow++);
            headerRow.createCell(0).setCellValue("MEAL");
            headerRow.getCell(0).setCellStyle(headerStyle);
            for (int i = 0; i < days.length; i++) {
                Cell cell = headerRow.createCell(i + 1);
                cell.setCellValue(days[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data Rows
            for (int r = 0; r < meals.length; r++) {
                Row row = sheet.createRow(currentRow++);
                Cell mealLabelCell = row.createCell(0);
                mealLabelCell.setCellValue(meals[r]);
                mealLabelCell.setCellStyle(dataStyle);
                
                for (int c = 0; c < days.length; c++) {
                    final String day = days[c];
                    final String meal = meals[r];
                    String items = menu.getItems().stream()
                            .filter(i -> i.getWeekCycle() == currentCycle && i.getDay().equalsIgnoreCase(day) && i.getMealType().equalsIgnoreCase(meal))
                            .map(MessMenuItem::getFoodItems)
                            .findFirst().orElse("-");
                    Cell dataCell = row.createCell(c + 1);
                    dataCell.setCellValue(items);
                    dataCell.setCellStyle(dataStyle);
                }
            }
            currentRow += 2; // space between tables
        }

        for (int i = 0; i <= days.length; i++) {
            sheet.setColumnWidth(i, 20 * 256);
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();
        return baos.toByteArray();
    }

    public void deleteMenu(Long id, Long hostelId) {
        MessMenu menu = menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu not found"));
        // IDOR check: only the hostel that owns this menu may delete it
        if (!menu.getHostelId().equals(hostelId)) {
            throw new RuntimeException("Unauthorized: this menu does not belong to your hostel");
        }
        menuRepository.deleteById(id);
    }
}
